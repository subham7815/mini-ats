import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import connectDB, { closeDB } from '../config/db';

describe('ATS API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('GET / should return 200 and root API information', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Mini ATS API is running');
    expect(res.body.status).toBe('OK');
    expect(res.body.documentation).toBeDefined();
  });

  it('GET /api should return 200 and root API information', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Mini ATS API is running');
    expect(res.body.status).toBe('OK');
  });

  it('GET /api/health should return 200 and healthy status with DB info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toContain('ATS API Server is running');
    expect(res.body.database).toBeDefined();
  });

  it('GET /api/jobs should return a list of jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/jobs should create a new job opening', async () => {
    const newJob = {
      title: 'QA Automation Engineer',
      department: 'Engineering',
      description: 'Ensure product reliability through automated testing.',
      requiredSkills: ['Cypress', 'JavaScript', 'Jest'],
      location: 'Remote',
      employmentType: 'Full-time',
      openings: 2
    };

    const res = await request(app)
      .post('/api/jobs')
      .send(newJob);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(newJob.title);
  });

  it('GET /api/candidates should return candidates with pagination', async () => {
    const res = await request(app).get('/api/candidates?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/dashboard/metrics should return aggregate recruitment KPI data', async () => {
    const res = await request(app).get('/api/dashboard/metrics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCandidates).toBeGreaterThan(0);
    expect(res.body.data.activeJobs).toBeGreaterThan(0);
  });

  it('GET /api/search should find matching candidates', async () => {
    const res = await request(app).get('/api/search?q=Sarah');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.candidates).toBeDefined();
  });
});
