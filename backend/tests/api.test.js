import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
import { runMigrations } from '../src/migrations/run_migrations.js';

describe('LeafIQ Backend API Integration Tests', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;

  let scanAId;
  let scanBId;
  let questionIds = [];
  let sampleImagePath;

  const timestamp = Date.now();
  const userAEmail = `usera_${timestamp}@leafiq.org`;
  const userBEmail = `userb_${timestamp}@leafiq.org`;

  beforeAll(async () => {
    await runMigrations();

    await query(
      'TRUNCATE users, scans, evidence, smart_questions, answers, alternative_possibilities, action_plans, scan_comparisons CASCADE'
    );

    const tempDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    sampleImagePath = path.join(tempDir, `test_leaf_${timestamp}.jpg`);

    // Create a 256x256 valid leaf image using Python/Pillow
    const pythonExe = process.env.PYTHON_PATH || 'C:\\Users\\Parth Gautam\\AppData\\Local\\Programs\\Python311\\python.exe';
    const pyScript = `from PIL import Image, ImageDraw; img = Image.new('RGB', (256, 256), (40, 40, 40)); draw = ImageDraw.Draw(img); draw.ellipse([30, 20, 226, 236], fill=(50, 160, 60), outline=(30, 110, 40), width=2); draw.line([128, 30, 128, 230], fill=(70, 190, 80), width=2); img.save(r'${sampleImagePath}', 'JPEG')`;
    execSync(`"${pythonExe}" -c "${pyScript}"`);
  });

  afterAll(async () => {
    if (fs.existsSync(sampleImagePath)) {
      fs.unlinkSync(sampleImagePath);
    }
    await pool.end();
  });

  // ---------------------------------------------------------------------------
  // 1. Healthcheck
  // ---------------------------------------------------------------------------
  test('GET /api/health should return status ok and connected DB', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  // ---------------------------------------------------------------------------
  // 2. Authentication Workflows
  // ---------------------------------------------------------------------------
  describe('Authentication API', () => {
    test('POST /api/auth/register should create User A and return JWT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: userAEmail,
        password: 'password123',
        full_name: 'Farmer User A',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(userAEmail);

      userAToken = res.body.data.token;
      userAId = res.body.data.user.id;
    });

    test('POST /api/auth/register should create User B', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: userBEmail,
        password: 'password123',
        full_name: 'Farmer User B',
      });

      expect(res.status).toBe(201);
      userBToken = res.body.data.token;
      userBId = res.body.data.user.id;
    });

    test('POST /api/auth/login should authenticate User A with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('GET /api/auth/me should return authenticated profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(userAId);
    });

    test('GET /api/auth/me should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Scan Upload & Validation
  // ---------------------------------------------------------------------------
  describe('Scan Upload & AI Validation', () => {
    test('POST /api/scans/upload should upload photo and create scan for User A', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('image', sampleImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scan.id).toBeDefined();
      expect(res.body.data.scan.status).toBe('uploaded');

      scanAId = res.body.data.scan.id;
    });

    test('POST /api/scans/:id/analyze should execute AI analysis and return initial findings + questions', async () => {
      const res = await request(app)
        .post(`/api/scans/${scanAId}/analyze`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.initial_assessment.crop).toBeDefined();
      expect(res.body.data.questions.length).toBeGreaterThan(0);

      questionIds = res.body.data.questions.map((q) => q.id);
    }, 30000);
  });

  // ---------------------------------------------------------------------------
  // 4. Smart Questions & Farmer Answers
  // ---------------------------------------------------------------------------
  describe('Smart Questions & Farmer Answers', () => {
    test('GET /api/scans/:id/questions should retrieve questions for scan', async () => {
      const res = await request(app)
        .get(`/api/scans/${scanAId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.questions.length).toBeGreaterThan(0);
    });

    test('POST /api/scans/:id/answers should submit farmer answers', async () => {
      const answerPayload = {
        answers: questionIds.map((qId) => ({
          question_id: qId,
          selected_options: ['Older leaves near the bottom'],
        })),
      };

      const res = await request(app)
        .post(`/api/scans/${scanAId}/answers`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(answerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answers.length).toBe(questionIds.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Final Assessment & Action Plan
  // ---------------------------------------------------------------------------
  describe('Final Assessment Synthesis & Action Plan', () => {
    test('POST /api/scans/:id/finalize should synthesize final assessment & action plan', async () => {
      const res = await request(app)
        .post(`/api/scans/${scanAId}/finalize`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scan.status).toBe('completed');
      expect(res.body.data.action_plan.immediate_actions.length).toBeGreaterThan(0);
      expect(res.body.data.evidence.farmer_reported.length).toBeGreaterThan(0);
    });

    test('GET /api/scans/:id should return complete scan snapshot', async () => {
      const res = await request(app)
        .get(`/api/scans/${scanAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.scan.id).toBe(scanAId);
      expect(res.body.data.action_plan).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. User Ownership Isolation Guardrails
  // ---------------------------------------------------------------------------
  describe('Ownership Isolation Safeguards', () => {
    test('User B should NOT be able to access User A scan details', async () => {
      const res = await request(app)
        .get(`/api/scans/${scanAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('User B should NOT be able to submit answers for User A scan', async () => {
      const targetQId = questionIds.length > 0 ? questionIds[0] : '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/api/scans/${scanAId}/answers`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          answers: [{ question_id: targetQId, selected_options: ['Test'] }],
        });

      expect(res.status).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Re-scan & Qualitative Comparison
  // ---------------------------------------------------------------------------
  describe('Re-Scan & Comparison Workflow', () => {
    test('User A should create a follow-up scan referencing baseline scan', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('parent_scan_id', scanAId)
        .attach('image', sampleImagePath);

      expect(res.status).toBe(201);
      expect(res.body.data.scan.parent_scan_id).toBe(scanAId);

      scanBId = res.body.data.scan.id;
    });

    test('POST /api/scans/:id/compare should return qualitative trajectory comparison', async () => {
      const res = await request(app)
        .post(`/api/scans/${scanAId}/compare`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ followup_scan_id: scanBId });

      expect(res.status).toBe(201);
      expect(res.body.data.comparison.trajectory).toBeDefined();
      expect(res.body.data.comparison.comparison_summary).toBeDefined();
    });
  });
});

