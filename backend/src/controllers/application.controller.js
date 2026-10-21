const Application = require('../models/Application');
const JobDrive = require('../models/JobDrive');
const Student = require('../models/Student');
const EligibilityService = require('../services/eligibility.service');

/**
 * @desc    Submit application for a job drive
 * @route   POST /api/v1/applications
 * @access  Student
 */
const applyForDrive = async (req, res, next) => {
  try {
    const { jobDriveId } = req.body;

    if (!req.user.studentProfile) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No student profile associated with this account' }
      });
    }

    const student = await Student.findById(req.user.studentProfile).populate('department');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
    }

    const drive = await JobDrive.findById(jobDriveId).populate('eligibilityCriteria.eligibleDepartments');
    if (!drive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Placement drive not found' }
      });
    }

    // 1. Check drive status
    if (drive.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: { code: 'DRIVE_CLOSED', message: `Cannot apply: Drive status is '${drive.status}'` }
      });
    }

    // 2. Check application deadline
    if (new Date(drive.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'DEADLINE_PASSED', message: 'The application deadline for this drive has passed' }
      });
    }

    // 3. Check for existing application
    const existing = await Application.findOne({
      student: student._id,
      jobDrive: drive._id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_APPLICATION',
          message: 'You have already submitted an application for this placement drive'
        }
      });
    }

    // 4. Backend Re-verification of Eligibility
    const evaluation = EligibilityService.evaluate(student, drive);
    if (!evaluation.isEligible) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ELIGIBLE',
          message: 'You do not satisfy the eligibility requirements for this drive',
          details: evaluation.reasons
        }
      });
    }

    // 5. Create application record
    const application = await Application.create({
      student: student._id,
      jobDrive: drive._id,
      currentStage: 'Applied',
      stageHistory: [
        {
          stage: 'Applied',
          updatedBy: req.user._id,
          updatedAt: new Date(),
          remarks: 'Application submitted successfully'
        }
      ],
      studentSnapshot: {
        cgpa: student.cgpa,
        activeBacklogs: student.activeBacklogs,
        department: student.department?._id || student.department,
        batch: student.batch
      },
      isEligibleAtApply: true,
      appliedAt: new Date()
    });

    await application.populate({
      path: 'jobDrive',
      select: 'title company location salaryPackage',
      populate: { path: 'company', select: 'name' }
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by logged-in student
 * @route   GET /api/v1/applications/my-applications
 * @access  Student
 */
const getMyApplications = async (req, res, next) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No student profile linked' }
      });
    }

    const applications = await Application.find({ student: req.user.studentProfile })
      .populate({
        path: 'jobDrive',
        populate: { path: 'company', select: 'name website industry' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (with filters)
 * @route   GET /api/v1/applications
 * @access  Admin
 */
const getApplications = async (req, res, next) => {
  try {
    const { jobDriveId, stage, search, department } = req.query;
    const query = {};

    if (jobDriveId) query.jobDrive = jobDriveId;
    if (stage) query.currentStage = stage;

    let studentIds = null;
    if (search || department) {
      const studentQuery = {};
      if (search) {
        studentQuery.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } }
        ];
      }
      if (department) studentQuery.department = department;

      const matchingStudents = await Student.find(studentQuery).select('_id');
      studentIds = matchingStudents.map((s) => s._id);
      query.student = { $in: studentIds };
    }

    const applications = await Application.find(query)
      .populate('student', 'fullName rollNumber email cgpa activeBacklogs department batch phone')
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'code name' }
      })
      .populate({
        path: 'jobDrive',
        select: 'title company location salaryPackage status',
        populate: { path: 'company', select: 'name industry' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/v1/applications/:id
 * @access  Admin or Owner Student
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'name code' }
      })
      .populate({
        path: 'jobDrive',
        populate: { path: 'company' }
      })
      .populate('stageHistory.updatedBy', 'email role');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Role check
    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== application.student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only view your own applications.' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update selection stage for an application
 * @route   PATCH /api/v1/applications/:id/stage
 * @access  Admin
 */
const updateApplicationStage = async (req, res, next) => {
  try {
    const { stage, remarks } = req.body;

    const application = await Application.findById(req.params.id).populate('jobDrive');
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Update current stage and append to history
    application.currentStage = stage;
    application.stageHistory.push({
      stage,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      remarks: remarks || `Moved to ${stage} stage`
    });

    await application.save();

    // Synchronize Student placementStatus if status changes
    const student = await Student.findById(application.student);
    if (student) {
      if (stage === 'Selected' || stage === 'Offered' || stage === 'Joined') {
        student.placementStatus = stage === 'Joined' ? 'Placed' : stage;
        if (stage === 'Joined' || stage === 'Offered') {
          student.placedDetails = {
            company: application.jobDrive?.company,
            role: application.jobDrive?.title,
            packageLPA: application.jobDrive?.salaryPackage?.ctcLpa,
            offerDate: new Date()
          };
        }
        await student.save();
      } else if (stage === 'Shortlisted' && student.placementStatus === 'Unplaced') {
        student.placementStatus = 'Shortlisted';
        await student.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application advanced to stage: ${stage}`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForDrive,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStage
};
