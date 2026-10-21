const JobDrive = require('../models/JobDrive');
const Student = require('../models/Student');
const Application = require('../models/Application');
const EligibilityService = require('../services/eligibility.service');

/**
 * @desc    Get all placement drives
 * @route   GET /api/v1/placement-drives
 * @access  Authenticated
 */
const getJobDrives = async (req, res, next) => {
  try {
    const { status, company, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else if (req.user.role === 'student') {
      // Students default to viewing active drives
      query.status = { $in: ['Active', 'Closed'] };
    }

    if (company) query.company = company;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const drives = await JobDrive.find(query)
      .populate('company', 'name website industry address')
      .populate('eligibilityCriteria.eligibleDepartments', 'name code')
      .sort({ createdAt: -1 });

    // If request is made by a student, annotate each drive with real-time eligibility & application status
    if (req.user.role === 'student' && req.user.studentProfile) {
      const student = await Student.findById(req.user.studentProfile).populate('department');

      // Fetch all applications student has submitted
      const studentApplications = await Application.find({ student: student._id }).select('jobDrive currentStage');
      const appliedMap = new Map();
      studentApplications.forEach((app) => appliedMap.set(app.jobDrive.toString(), app.currentStage));

      const annotatedDrives = drives.map((drive) => {
        const driveObj = drive.toObject();
        const evaluation = EligibilityService.evaluate(student, drive);
        const hasApplied = appliedMap.has(drive._id.toString());
        const applicationStage = appliedMap.get(drive._id.toString()) || null;
        const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();

        return {
          ...driveObj,
          studentContext: {
            isEligible: evaluation.isEligible,
            eligibilityReasons: evaluation.reasons,
            breakdown: evaluation.breakdown,
            hasApplied,
            applicationStage,
            isDeadlinePassed,
            canApply: evaluation.isEligible && !hasApplied && !isDeadlinePassed && drive.status === 'Active'
          }
        };
      });

      return res.status(200).json({
        success: true,
        count: annotatedDrives.length,
        data: annotatedDrives
      });
    }

    return res.status(200).json({
      success: true,
      count: drives.length,
      data: drives
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single drive by ID
 * @route   GET /api/v1/placement-drives/:id
 * @access  Authenticated
 */
const getJobDriveById = async (req, res, next) => {
  try {
    const drive = await JobDrive.findById(req.params.id)
      .populate('company')
      .populate('eligibilityCriteria.eligibleDepartments', 'name code')
      .populate('createdBy', 'email');

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Placement drive not found' }
      });
    }

    const driveObj = drive.toObject();

    // If admin, compute eligible vs ineligible student metrics
    if (req.user.role === 'admin') {
      const allStudents = await Student.find().populate('department');
      const { eligible, ineligible } = EligibilityService.classifyStudents(allStudents, drive);

      driveObj.adminAnalytics = {
        totalStudentsCount: allStudents.length,
        eligibleCount: eligible.length,
        ineligibleCount: ineligible.length,
        eligibleStudentsSample: eligible.slice(0, 10).map((e) => ({
          _id: e.student._id,
          fullName: e.student.fullName,
          rollNumber: e.student.rollNumber,
          cgpa: e.student.cgpa,
          department: e.student.department?.code
        })),
        ineligibleStudentsSample: ineligible.slice(0, 10).map((ie) => ({
          _id: ie.student._id,
          fullName: ie.student.fullName,
          rollNumber: ie.student.rollNumber,
          cgpa: ie.student.cgpa,
          department: ie.student.department?.code,
          reasons: ie.evaluation.reasons
        }))
      };
    }

    // If student, attach eligibility evaluation
    if (req.user.role === 'student' && req.user.studentProfile) {
      const student = await Student.findById(req.user.studentProfile).populate('department');
      const evaluation = EligibilityService.evaluate(student, drive);
      const existingApplication = await Application.findOne({
        student: student._id,
        jobDrive: drive._id
      });

      const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();

      driveObj.studentContext = {
        isEligible: evaluation.isEligible,
        eligibilityReasons: evaluation.reasons,
        breakdown: evaluation.breakdown,
        hasApplied: !!existingApplication,
        applicationStage: existingApplication ? existingApplication.currentStage : null,
        isDeadlinePassed,
        canApply: evaluation.isEligible && !existingApplication && !isDeadlinePassed && drive.status === 'Active'
      };
    }

    return res.status(200).json({
      success: true,
      data: driveObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current student's eligibility breakdown for a specific drive
 * @route   GET /api/v1/placement-drives/:id/eligibility
 * @access  Student
 */
const getDriveEligibility = async (req, res, next) => {
  try {
    const drive = await JobDrive.findById(req.params.id).populate('eligibilityCriteria.eligibleDepartments');
    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Placement drive not found' }
      });
    }

    if (!req.user.studentProfile) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_STUDENT_PROFILE', message: 'No student profile linked to this user' }
      });
    }

    const student = await Student.findById(req.user.studentProfile).populate('department');
    const evaluation = EligibilityService.evaluate(student, drive);

    return res.status(200).json({
      success: true,
      data: {
        driveId: drive._id,
        driveTitle: drive.title,
        ...evaluation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new placement drive
 * @route   POST /api/v1/placement-drives
 * @access  Admin
 */
const createJobDrive = async (req, res, next) => {
  try {
    const driveData = {
      ...req.body,
      createdBy: req.user._id
    };

    const drive = await JobDrive.create(driveData);
    await drive.populate('company', 'name website industry');
    await drive.populate('eligibilityCriteria.eligibleDepartments', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Placement drive published successfully',
      data: drive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update placement drive
 * @route   PATCH /api/v1/placement-drives/:id
 * @access  Admin
 */
const updateJobDrive = async (req, res, next) => {
  try {
    const drive = await JobDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('company', 'name website industry')
      .populate('eligibilityCriteria.eligibleDepartments', 'name code');

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Placement drive not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully',
      data: drive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete placement drive
 * @route   DELETE /api/v1/placement-drives/:id
 * @access  Admin
 */
const deleteJobDrive = async (req, res, next) => {
  try {
    const drive = await JobDrive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Placement drive not found' }
      });
    }

    // Delete associated applications
    await Application.deleteMany({ jobDrive: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Placement drive and associated applications removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobDrives,
  getJobDriveById,
  getDriveEligibility,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive
};
