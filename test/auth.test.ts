import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';

describe('authentication and protected routes', () => {
  let accessToken = '';
  beforeAll(() => {
    accessToken = jwt.sign({}, process.env.JWT_ACCESS_SECRET!, { subject: '507f1f77bcf86cd799439011', expiresIn: '5m' });
  });

  it('serves the health endpoint without authentication', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('rejects a doctor list request without an access cookie', async () => {
    const response = await request(app).get('/api/v1/doctors');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects invalid doctor input before database access', async () => {
    const response = await request(app)
      .post('/api/v1/doctors')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({ name: '', email: 'not-an-email' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Request validation failed');
  });

  it('does not allow malformed create requests to pass without authentication', async () => {
    const response = await request(app).post('/api/v1/doctors').send({});
    expect(response.status).toBe(401);
  });

  it('rejects an invalid date range before querying records', async () => {
    const response = await request(app)
      .get('/api/v1/doctors?startDate=not-a-date')
      .set('Cookie', `accessToken=${accessToken}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Request validation failed');
  });

  it('rejects an invalid doctor reference on a patient create request', async () => {
    const response = await request(app)
      .post('/api/v1/patients')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({ name: 'Sam Example', gender: 'OTHER', phone: '555-0100', address: 'Clinic Road', medicalCondition: 'Asthma', doctorId: 'bad-id' });
    expect(response.status).toBe(400);
  });

  it('clears both auth cookies when logout is called', async () => {
    const response = await request(app).post('/api/v1/auth/logout');
    const cookies = response.headers['set-cookie'] as string[];
    expect(response.status).toBe(200);
    expect(cookies).toHaveLength(2);
    expect(cookies.every(cookie => cookie.includes('Path=/api/v1') && cookie.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
  });

  it('rejects a state-changing request from an untrusted browser origin', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Origin', 'https://attacker.example');
    expect(response.status).toBe(403);
  });
});
