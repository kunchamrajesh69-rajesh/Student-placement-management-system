const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');
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

describe('Student Management & RBAC Permissions API', () => {
  let adminToken, studentToken, dept, studentUser, studentRecord;

  beforeEach(async () => {
    dept = await Department.create({ code: 'CSE', name: 'Computer Science' });

    // 1. Admin User
    const adminUser = await User.create({
      email: 'admin.tests@college.edu',
      password: 'AdminPassword123!',
      role: 'admin'
    });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.tests@college.edu', password: 'AdminPassword123!' });
    adminToken = adminLogin.body.token;

    // 2. Student User & Profile
    studentUser = new User({
      email: 'student.rbac@college.edu',
      password: 'StudentPassword123!',
      role: 'student'
    });
    studentRecord = new Student({
      user: studentUser._id,
      rollNumber: '21CS555',
      fullName: 'RBAC Test Student',
      email: 'student.rbac@college.edu',
      phone: '9876543210',
      department: dept._id,
      batch: 2025,
      cgpa: 7.5,
      activeBacklogs: 0
    });
    studentUser.studentProfile = studentRecord._id;
    await studentUser.save();
    await studentRecord.save();

    const studentLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student.rbac@college.edu', password: 'StudentPassword123!' });
    studentToken = studentLogin.body.token;
  });

  test('should allow student to update permitted fields (skills, phone, resumeUrl)', async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${studentRecord._id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        phone: '9999988888',
        skills: ['TypeScript', 'Angular', 'Node.js'],
        resumeUrl: 'https://storage.college.edu/resumes/updated.pdf'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('9999988888');
    expect(res.body.data.skills).toContain('Angular');
  });

  test('should ignore student attempt to tamper with academic CGPA or backlogs', async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${studentRecord._id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        cgpa: 9.99, // Tamper attempt
        activeBacklogs: 0,
        phone: '9111122222'
      });

    expect(res.statusCode).toBe(200);
    // Student's CGPA must remain unchanged at 7.5
    expect(res.body.data.cgpa).toBe(7.5);
    expect(res.body.data.phone).toBe('9111122222');
  });

  test('should allow admin to update student academic CGPA and records', async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${studentRecord._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cgpa: 8.8
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cgpa).toBe(8.8);
  });

  test('should prevent student from viewing other students profile list', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
