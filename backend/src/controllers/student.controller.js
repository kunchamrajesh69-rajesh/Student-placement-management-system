const Student = require('../models/Student');
const User = require('../models/User');

/**
 * @desc    Get all students with filtering, search & pagination
 * @route   GET /api/v1/students
 * @access  Admin
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      department,
      batch,
      placementStatus,
      minCgpa,
      maxBacklogs,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    // Search by full name, roll number, or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;
    if (batch) query.batch = Number(batch);
    if (placementStatus) query.placementStatus = placementStatus;
    if (minCgpa) query.cgpa = { $gte: Number(minCgpa) };
    if (maxBacklogs !== undefined) query.activeBacklogs = { $lte: Number(maxBacklogs) };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('department', 'name code')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: students.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/v1/students/:id
 * @access  Admin or Student Owner
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department', 'name code')
      .populate('placedDetails.company', 'name industry');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
    }

    // Role check: if student, must be their own record
    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only view your own student profile.' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create student and corresponding user credentials
 * @route   POST /api/v1/students
 * @access  Admin
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      rollNumber,
      fullName,
      email,
      password,
      phone,
      department,
      batch,
      cgpa,
      activeBacklogs,
      historicalBacklogs,
      skills,
      resumeUrl
    } = req.body;

    // Check if email or roll number already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'User with this email already exists' }
      });
    }

    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_ROLL', message: 'Student with this roll number already exists' }
      });
    }

    // 1. Create Student record
    const student = new Student({
      rollNumber: rollNumber.toUpperCase(),
      fullName,
      email,
      phone,
      department,
      batch,
      cgpa,
      activeBacklogs: activeBacklogs || 0,
      historicalBacklogs: historicalBacklogs || 0,
      skills: skills || [],
      resumeUrl
    });

    // 2. Create User record
    const user = new User({
      email,
      password,
      role: 'student',
      studentProfile: student._id
    });

    // Link user back to student
    student.user = user._id;

    await user.save();
    await student.save();

    await student.populate('department', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student profile
 * @route   PATCH /api/v1/students/:id
 * @access  Admin or Student Owner
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
    }

    // Role-based field restrictions
    if (req.user.role === 'student') {
      const currentStudentId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();
      if (currentStudentId !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only update your own student profile.' }
        });
      }

      // Students are ONLY permitted to update contact and portfolio fields
      const permittedFields = ['phone', 'skills', 'certifications', 'projects', 'resumeUrl'];
      permittedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          student[field] = req.body[field];
        }
      });
    } else {
      // Admin has full modification rights
      Object.keys(req.body).forEach((key) => {
        if (key !== '_id' && key !== 'user') {
          student[key] = req.body[key];
        }
      });
    }

    await student.save();
    await student.populate('department', 'name code');

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student and linked user
 * @route   DELETE /api/v1/students/:id
 * @access  Admin
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found' }
      });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);

    return res.status(200).json({
      success: true,
      message: 'Student and linked login credentials deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
