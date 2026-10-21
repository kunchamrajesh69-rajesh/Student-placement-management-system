const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
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

describe('Authentication API (/api/v1/auth)', () => {
  test('should return 401 for non-existent user login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('should successfully log in valid user and set auth cookie', async () => {
    // Create test user
    const user = await User.create({
      email: 'officer@placement.edu',
      password: 'SecurePassword123!',
      role: 'admin',
      isActive: true
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'officer@placement.edu',
        password: 'SecurePassword123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('officer@placement.edu');
    expect(res.body.user.role).toBe('admin');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('should reject login with incorrect password', async () => {
    await User.create({
      email: 'test@student.edu',
      password: 'CorrectPassword123!',
      role: 'student'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@student.edu',
        password: 'WrongPassword!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('should return current user in /auth/me with valid Bearer token', async () => {
    const user = await User.create({
      email: 'me_test@placement.edu',
      password: 'Password123!',
      role: 'admin'
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'me_test@placement.edu',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe('me_test@placement.edu');
    expect(meRes.body.user.role).toBe('admin');
  });
});
