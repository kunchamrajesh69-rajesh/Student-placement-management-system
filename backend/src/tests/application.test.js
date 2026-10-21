const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Company = require('../models/Company');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Application Management & Duplicate Prevention API', () => {
  let studentUser, studentRecord, eligibleDrive, expiredDrive, token, dept;

  beforeEach(async () => {
    // 1. Create department
    dept = await Department.create({
      code: 'CSE',
      name: 'Computer Science and Engineering'
    });

    // 2. Create company
    const company = await Company.create({
      name: 'Tech Corp',
      industry: 'Software'
    });

    // 3. Create student user and profile (Eligible: CGPA 8.5, 0 backlogs)
    studentUser = new User({
      email: 'student.app@college.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    studentRecord = new Student({
      user: studentUser._id,
      rollNumber: '21CS999',
      fullName: 'App Test Student',
      email: 'student.app@college.edu',
      phone: '9876543210',
      department: dept._id,
      batch: 2025,
      cgpa: 8.5,
      activeBacklogs: 0
    });
    studentUser.studentProfile = studentRecord._id;
    await studentUser.save();
    await studentRecord.save();

    // 4. Create active eligible drive
    eligibleDrive = await JobDrive.create({
      title: 'Graduate Software Engineer',
      company: company._id,
      description: 'Role for top programmers',
      location: 'Bengaluru',
      salaryPackage: { ctcLpa: 12.0 },
      applicationDeadline: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days in future
      eligibilityCriteria: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        eligibleDepartments: [dept._id],
        eligibleBatches: [2025]
      },
      status: 'Active'
    });

    // 5. Create expired drive
    expiredDrive = await JobDrive.create({
      title: 'Expired Internship',
      company: company._id,
      description: 'Past drive',
      location: 'Remote',
      salaryPackage: { ctcLpa: 6.0 },
      applicationDeadline: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days in past
      eligibilityCriteria: { minCgpa: 6.0 },
      status: 'Active'
    });

    // Login to obtain JWT
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student.app@college.edu',
        password: 'StudentPassword123!'
      });
    token = loginRes.body.token;
  });

  test('should allow eligible student to submit application successfully', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobDriveId: eligibleDrive._id.toString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStage).toBe('Applied');
    expect(res.body.data.studentSnapshot.cgpa).toBe(8.5);
  });

  test('should reject duplicate application for the same job drive with 409', async () => {
    // First application
    await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDriveId: eligibleDrive._id.toString() });

    // Second application (duplicate)
    const duplicateRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDriveId: eligibleDrive._id.toString() });

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.error.code).toBe('DUPLICATE_APPLICATION');
  });

  test('should reject application if application deadline has passed with 400', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobDriveId: expiredDrive._id.toString()
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DEADLINE_PASSED');
  });

  test('should reject application if student does not meet backend eligibility', async () => {
    // Lower student CGPA below requirement
    await Student.findByIdAndUpdate(studentRecord._id, { cgpa: 5.5 });

    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobDriveId: eligibleDrive._id.toString()
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_ELIGIBLE');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});
