const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn(),
  initDatabase: jest.fn(),
  closePool: jest.fn(),
  withTransaction: jest.fn((work) => work({ query: jest.fn() }))
}));

jest.mock('../services/pdfService', () => ({
  generateFirPdf: jest.fn().mockResolvedValue('http://localhost:5000/generated/firs/fir-test.pdf')
}));

const { query } = require('../db');
const createApp = require('../app');

const app = createApp();

describe('API route coverage', () => {
  beforeEach(() => {
    query.mockReset();
  });

  test('GET / root health', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Sahayak Backend API');
  });

  test('POST /api/auth/register', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u1', name: 'John', email: 'john@example.com', phone: '9999999999', role: 'user' }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', phone: '9999999999', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  test('POST /api/auth/login', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('secret123', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 'u1', name: 'John', email: 'john@example.com', phone: '9999999999', role: 'user', password_hash: hash }] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('user');
  });

  test('GET /api/blogs', async () => {
    query.mockResolvedValueOnce({ rows: [{ _id: 'b1', slug: 'post-1', title: 'Post 1', tags: [], status: 'published' }] });
    const res = await request(app).get('/api/blogs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/admin/auth/login', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 'a1', username: 'admin', role: 'admin', password_hash: hash }] });

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('GET /api/admin/blogs', async () => {
    query.mockResolvedValueOnce({ rows: [{ _id: 'b1', slug: 'post-1', title: 'Post 1', tags: [], status: 'draft' }] });
    const res = await request(app).get('/api/admin/blogs');
    expect(res.status).toBe(200);
  });

  test('GET /api/schemes', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/schemes');
    expect(res.status).toBe(200);
  });

  test('GET /api/alerts', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
  });

  test('POST /api/fir with user token', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', role: 'user' }, process.env.JWT_SECRET || 'dev-secret-change-me');

    query.mockResolvedValueOnce({
      rows: [{
        _id: 'f1',
        userId: 'u1',
        incidentType: 'UPI Fraud',
        incidentDate: new Date().toISOString(),
        location: 'Pune',
        estimatedLoss: 100,
        contactDetails: {},
        incidentNarrative: 'Narrative details for FIR report',
        suspectDetails: {},
        evidence: [],
        status: 'Draft',
        applicationNumber: null,
        isDraft: true,
        pdfUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    });

    const res = await request(app)
      .post('/api/fir')
      .set('Authorization', `Bearer ${token}`)
      .send({
        incidentType: 'UPI Fraud',
        incidentDate: new Date().toISOString(),
        location: 'Pune',
        estimatedLoss: 100,
        incidentNarrative: 'Narrative details for FIR report'
      });

    expect(res.status).toBe(201);
    expect(res.body._id).toBe('f1');
  });

  test('GET /api/admin/firs with admin token', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'a1', role: 'admin' }, process.env.JWT_SECRET || 'dev-secret-change-me');
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/admin/firs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('POST /api/fir/:id/pdf with owner token', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', role: 'user' }, process.env.JWT_SECRET || 'dev-secret-change-me');

    query
      .mockResolvedValueOnce({
        rows: [{
          _id: 'f1',
          userId: 'u1',
          incidentType: 'UPI Fraud',
          incidentDate: new Date().toISOString(),
          location: 'Pune',
          estimatedLoss: 500,
          contactDetails: {},
          incidentNarrative: 'Narrative details for FIR report',
          suspectDetails: {},
          evidence: [],
          status: 'Incident Logged',
          applicationNumber: 'APP123',
          isDraft: false,
          pdfUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          _id: 'f1',
          userId: 'u1',
          incidentType: 'UPI Fraud',
          incidentDate: new Date().toISOString(),
          location: 'Pune',
          estimatedLoss: 500,
          contactDetails: {},
          incidentNarrative: 'Narrative details for FIR report',
          suspectDetails: {},
          evidence: [],
          status: 'Incident Logged',
          applicationNumber: 'APP123',
          isDraft: false,
          pdfUrl: 'http://localhost:5000/generated/firs/fir-test.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      });

    const res = await request(app)
      .post('/api/fir/f1/pdf')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.pdfUrl).toContain('/generated/firs/');
  });
});
