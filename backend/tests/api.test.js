const request = require('supertest');
const app = require('../src/index');

const BASE_URL = '/api/auth';

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post(`${BASE_URL}/register`)
        .send(testUser)
        .expect(400);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'Password123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          name: 'Test',
          email: 'test2@example.com',
          password: 'weak'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /profile', () => {
    let authToken = '';

    beforeAll(async () => {
      const response = await request(app)
        .post(`${BASE_URL}/login`)
        .send({
          email: testUser.email,
          password: testUser.password
        });
      authToken = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      await request(app)
        .get(`${BASE_URL}/profile`)
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get(`${BASE_URL}/profile`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

describe('Tasks API', () => {
  const BASE_URL = '/api/tasks';
  let authToken = '';
  let testUser = {
    name: 'API Test User',
    email: `apitest-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    authToken = response.body.token;
  });

  describe('GET /tasks', () => {
    it('should get empty task list for new user', async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test description'
        })
        .expect(201);

      expect(response.body).toHaveProperty('taskId');
    });

    it('should reject task without title', async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No title'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Teams API', () => {
  const BASE_URL = '/api/teams';
  let adminToken = '';
  let userToken = '';
  
  const adminUser = {
    name: 'Admin User',
    email: `admin-${Date.now()}@example.com`,
    password: 'AdminPassword123!',
    role: 'admin'
  };
  
  const regularUser = {
    name: 'Regular User',
    email: `regular-${Date.now()}@example.com`,
    password: 'RegularPassword123!'
  };

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send(adminUser);
    
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminResponse.body.token;
    
    await request(app)
      .post('/api/auth/register')
      .send(regularUser);
    
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: regularUser.email, password: regularUser.password });
    userToken = userResponse.body.token;
  });

  describe('GET /teams', () => {
    it('should allow admin to list teams', async () => {
      await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user from listing teams', async () => {
      await request(app)
        .get(BASE_URL)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});