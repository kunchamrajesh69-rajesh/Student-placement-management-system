const Offer = require('../models/Offer');
const Application = require('../models/Application');
const Student = require('../models/Student');

/**
 * @desc    Issue placement offer
 * @route   POST /api/v1/offers
 * @access  Admin
 */
const createOffer = async (req, res, next) => {
  try {
    const { applicationId, designation, packageLPA, joiningDate, offerLetterUrl, remarks } = req.body;

    const application = await Application.findById(applicationId).populate('jobDrive');
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Check if offer already issued for this application
    const existingOffer = await Offer.findOne({ application: application._id });
    if (existingOffer) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_OFFER', message: 'An offer has already been issued for this application' }
      });
    }

    const offer = await Offer.create({
      application: application._id,
      student: application.student,
      jobDrive: application.jobDrive._id,
      company: application.jobDrive.company,
      designation,
      packageLPA,
      joiningDate,
      offerLetterUrl,
      remarks,
      status: 'Offered'
    });

    // Advance application stage
    application.currentStage = 'Offered';
    application.stageHistory.push({
      stage: 'Offered',
      updatedBy: req.user._id,
      updatedAt: new Date(),
      remarks: `Offer letter issued: ${designation} (${packageLPA} LPA)`
    });
    await application.save();

    // Update student placement status
    await Student.findByIdAndUpdate(application.student, {
      placementStatus: 'Offered',
      placedDetails: {
        company: application.jobDrive.company,
        role: designation,
        packageLPA,
        offerDate: new Date()
      }
    });

    await offer.populate(['student', 'jobDrive', 'company']);

    return res.status(201).json({
      success: true,
      message: 'Placement offer generated successfully',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get offers
 * @route   GET /api/v1/offers
 * @access  Authenticated
 */
const getOffers = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user.studentProfile;
    }

    const offers = await Offer.find(query)
      .populate('student', 'fullName rollNumber email department batch')
      .populate('company', 'name industry website')
      .populate('jobDrive', 'title location salaryPackage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single offer by ID
 * @route   GET /api/v1/offers/:id
 * @access  Authenticated
 */
const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('student')
      .populate('company')
      .populate('jobDrive');

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Offer not found' }
      });
    }

    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== offer.student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are only authorized to view your own offers.' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update offer status (Accept/Decline by student; Joined by Admin)
 * @route   PATCH /api/v1/offers/:id/status
 * @access  Authenticated
 */
const updateOfferStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Offer not found' }
      });
    }

    // Role verification
    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== offer.student.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are only authorized to update your own offer.' }
        });
      }

      if (!['Accepted', 'Declined'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Students can only choose to Accept or Decline the offer.' }
        });
      }
    }

    offer.status = status;
    if (remarks) offer.remarks = remarks;
    await offer.save();

    // If joined or accepted, update student placement status
    if (status === 'Joined') {
      await Student.findByIdAndUpdate(offer.student, {
        placementStatus: 'Placed'
      });
      await Application.findByIdAndUpdate(offer.application, {
        currentStage: 'Joined',
        $push: {
          stageHistory: {
            stage: 'Joined',
            updatedBy: req.user._id,
            updatedAt: new Date(),
            remarks: 'Candidate joined organization'
          }
        }
      });
    } else if (status === 'Accepted') {
      await Student.findByIdAndUpdate(offer.student, {
        placementStatus: 'Placed'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Offer status marked as ${status}`,
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getOffers,
  getOfferById,
  updateOfferStatus
};
