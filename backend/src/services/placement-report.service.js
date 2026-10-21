const Student = require('../models/Student');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Department = require('../models/Department');
const Company = require('../models/Company');

class PlacementReportService {
  /**
   * Generates comprehensive placement statistics for the Admin Dashboard
   */
  static async getAdminDashboardStats() {
    const [
      totalStudents,
      placedStudentsCount,
      shortlistedCount,
      activeDrivesCount,
      totalApplications,
      totalOffers
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ placementStatus: { $in: ['Placed', 'Offered'] } }),
      Student.countDocuments({ placementStatus: 'Shortlisted' }),
      JobDrive.countDocuments({ status: 'Active' }),
      Application.countDocuments(),
      Offer.countDocuments()
    ]);

    const unplacedStudentsCount = Math.max(0, totalStudents - placedStudentsCount);
    const placementPercentage = totalStudents > 0 ? Number(((placedStudentsCount / totalStudents) * 100).toFixed(1)) : 0;

    // Department-wise placement stats
    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: {
              $cond: [{ $in: ['$placementStatus', ['Placed', 'Offered']] }, 1, 0]
            }
          },
          avgCgpa: { $avg: '$cgpa' }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          departmentCode: '$department.code',
          departmentName: '$department.name',
          totalStudents: 1,
          placedStudents: 1,
          avgCgpa: { $round: ['$avgCgpa', 2] },
          placementPercentage: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $round: [{ $multiply: [{ $divide: ['$placedStudents', '$totalStudents'] }, 100] }, 1] },
              0
            ]
          }
        }
      },
      { $sort: { departmentCode: 1 } }
    ]);

    // Package Statistics calculated from actual offer records
    const packageStatsAgg = await Offer.aggregate([
      {
        $group: {
          _id: null,
          highestPackage: { $max: '$packageLPA' },
          lowestPackage: { $min: '$packageLPA' },
          averagePackage: { $avg: '$packageLPA' },
          totalOffers: { $sum: 1 }
        }
      }
    ]);

    const packageStats = packageStatsAgg.length > 0 ? {
      highestLPA: packageStatsAgg[0].highestPackage || 0,
      lowestLPA: packageStatsAgg[0].lowestPackage || 0,
      averageLPA: Number((packageStatsAgg[0].averagePackage || 0).toFixed(2)),
      totalOffers: packageStatsAgg[0].totalOffers
    } : {
      highestLPA: 0,
      lowestLPA: 0,
      averageLPA: 0,
      totalOffers: 0
    };

    // Company-wise offers
    const companyStats = await Offer.aggregate([
      {
        $group: {
          _id: '$company',
          totalOffers: { $sum: 1 },
          avgPackage: { $avg: '$packageLPA' },
          maxPackage: { $max: '$packageLPA' }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          companyId: '$_id',
          companyName: '$company.name',
          totalOffers: 1,
          avgPackage: { $round: ['$avgPackage', 2] },
          maxPackage: '$maxPackage'
        }
      },
      { $sort: { totalOffers: -1 } },
      { $limit: 8 }
    ]);

    // Recent placement applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('student', 'fullName rollNumber email department')
      .populate('jobDrive', 'title company salaryPackage')
      .populate({
        path: 'jobDrive',
        populate: { path: 'company', select: 'name' }
      })
      .populate('student.department', 'code');

    return {
      summary: {
        totalStudents,
        placedStudents: placedStudentsCount,
        unplacedStudents: unplacedStudentsCount,
        shortlistedStudents: shortlistedCount,
        placementPercentage,
        activeDrives: activeDrivesCount,
        totalApplications,
        totalOffers
      },
      packageStats,
      departmentStats,
      companyStats,
      recentApplications
    };
  }

  /**
   * Generates Student Dashboard metrics
   */
  static async getStudentDashboardStats(studentId) {
    const student = await Student.findById(studentId).populate('department', 'name code');
    if (!student) throw new Error('Student not found');

    const [applications, offers, activeDrives] = await Promise.all([
      Application.find({ student: studentId }).populate({
        path: 'jobDrive',
        select: 'title company salaryPackage applicationDeadline status',
        populate: { path: 'company', select: 'name' }
      }),
      Offer.find({ student: studentId }).populate('company', 'name website industry'),
      JobDrive.find({ status: 'Active', applicationDeadline: { $gte: new Date() } }).populate('company', 'name')
    ]);

    // Calculate profile completeness
    let completenessScore = 30; // base score for academic creation
    if (student.phone) completenessScore += 10;
    if (student.resumeUrl) completenessScore += 20;
    if (student.skills && student.skills.length > 0) completenessScore += 20;
    if (student.projects && student.projects.length > 0) completenessScore += 10;
    if (student.certifications && student.certifications.length > 0) completenessScore += 10;
    completenessScore = Math.min(100, completenessScore);

    return {
      profile: student,
      completenessScore,
      totalApplications: applications.length,
      applications,
      offers,
      activeDrivesCount: activeDrives.length
    };
  }

  /**
   * Generates CSV string of placed student details
   */
  static async generatePlacementReportCSV() {
    const offers = await Offer.find()
      .populate('student', 'rollNumber fullName email cgpa department batch')
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'code name' }
      })
      .populate('company', 'name industry')
      .populate('jobDrive', 'title location');

    const headers = [
      'Roll Number',
      'Student Name',
      'Email',
      'Department',
      'Batch',
      'CGPA',
      'Company Name',
      'Designation',
      'Package (LPA)',
      'Status',
      'Offer Date',
      'Joining Date'
    ];

    const rows = offers.map((offer) => {
      const s = offer.student || {};
      const dept = s.department ? s.department.code : 'N/A';
      const comp = offer.company ? offer.company.name : 'N/A';
      return [
        `"${s.rollNumber || ''}"`,
        `"${s.fullName || ''}"`,
        `"${s.email || ''}"`,
        `"${dept}"`,
        `"${s.batch || ''}"`,
        `"${s.cgpa || ''}"`,
        `"${comp}"`,
        `"${offer.designation || ''}"`,
        `"${offer.packageLPA || 0}"`,
        `"${offer.status || ''}"`,
        `"${offer.offerDate ? new Date(offer.offerDate).toISOString().split('T')[0] : ''}"`,
        `"${offer.joiningDate ? new Date(offer.joiningDate).toISOString().split('T')[0] : ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

module.exports = PlacementReportService;
