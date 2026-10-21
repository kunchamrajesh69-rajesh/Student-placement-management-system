const Interview = require('../models/Interview');
const Application = require('../models/Application');

/**
 * @desc    Schedule interview round
 * @route   POST /api/v1/interviews
 * @access  Admin
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, roundName, interviewDate, interviewTime, mode, locationOrLink, instructions } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      jobDrive: application.jobDrive,
      roundName,
      interviewDate,
      interviewTime,
      mode,
      locationOrLink,
      instructions
    });

    // Automatically progress application stage to Interview if earlier
    if (['Applied', 'Shortlisted', 'Assessment'].includes(application.currentStage)) {
      application.currentStage = 'Interview';
      application.stageHistory.push({
        stage: 'Interview',
        updatedBy: req.user._id,
        updatedAt: new Date(),
        remarks: `Interview scheduled: ${roundName}`
      });
      await application.save();
    }

    await interview.populate([
      { path: 'student', select: 'fullName rollNumber email' },
      { path: 'jobDrive', select: 'title company' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get interviews
 * @route   GET /api/v1/interviews
 * @access  Authenticated
 */
const getInterviews = async (req, res, next) => {
  try {
    const { jobDriveId, status } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user.studentProfile;
    } else {
      if (jobDriveId) query.jobDrive = jobDriveId;
      if (status) query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate('student', 'fullName rollNumber email phone')
      .populate({
        path: 'jobDrive',
        select: 'title company location',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ interviewDate: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single interview by ID
 * @route   GET /api/v1/interviews/:id
 * @access  Authenticated
 */
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'jobDrive',
        populate: { path: 'company' }
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interview not found' }
      });
    }

    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== interview.student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not authorized to view this interview.' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update interview details / status / feedback
 * @route   PATCH /api/v1/interviews/:id
 * @access  Admin
 */
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('student jobDrive');

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interview not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview details updated successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview
};
