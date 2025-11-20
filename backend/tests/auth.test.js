import request from 'supertest';
import app from '../server.js';
import Utilisateur from '../models/utilisateurModel.js';
import Role from '../models/roleModel.js';
import bcrypt from 'bcryptjs';

describe('Authentication Tests', () => {
  let testUser;
  let testRole;
  let authToken;

  beforeAll(async () => {
    
    testRole = new Role({
      libelle: 'Test Role',
      code: 'test'
    });
    await testRole.save();

    
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = new Utilisateur({
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      matricule: 12345,
      roles: [{ role: testRole._id }],
      isActive: true,
      firstTimeLogin: false
    });
    await testUser.save();
  });

  describe('POST /api/utilisateurs/login', () => {
    it('should login with valid email and password', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      
      authToken = response.body.token;
    });

    it('should login with valid matricule and password', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/login')
        .send({
          email: '12345',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.matricule).toBe(12345);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('email ou matricule invalide');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('mot de passe invalide');
    });

    it('should reject inactive user', async () => {
      
      const inactiveUser = new Utilisateur({
        nom: 'Inactive',
        prenom: 'User',
        email: 'inactive@example.com',
        password: await bcrypt.hash('password123', 10),
        matricule: 54321,
        roles: [{ role: testRole._id }],
        isActive: false,
        firstTimeLogin: false
      });
      await inactiveUser.save();

      const response = await request(app)
        .post('/api/utilisateurs/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('compte est inactif');
    });
  });

  describe('POST /api/utilisateurs/validatetoken', () => {
    it('should validate valid token', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/validatetoken')
        .send({
          token: authToken
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('done !');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/utilisateurs/validatetoken')
        .send({
          token: 'invalid-token'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/utilisateurs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject protected route without token', async () => {
      const response = await request(app)
        .get('/api/utilisateurs');

      expect(response.status).toBe(401);
    });

    it('should reject protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/utilisateurs')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
