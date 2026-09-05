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

  let guestScanId;
  let userAScanId;
  let followupScanId;
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
    const defaultPy = path.resolve(process.cwd(), '../.venv/Scripts/python.exe');
    const pythonExe = process.env.PYTHON_PATH || (fs.existsSync(defaultPy) ? defaultPy : 'python');
    const pyScript = `from PIL import Image, ImageDraw; img = Image.new('RGB', (256, 256), (40, 40, 40)); draw = ImageDraw.Draw(img); draw.ellipse([30, 20, 226, 236], fill=(50, 160, 60), outline=(30, 110, 40), width=2); draw.line([128, 30, 128, 230], fill=(70, 190, 80), width=2); img.save(r'${sampleImagePath}', 'JPEG')`;
    execSync(`"${pythonExe}" -c "${pyScript}"`);
  });

  afterAll(async () => {
    if (fs.existsSync(sampleImagePath)) {
      try {
        fs.unlinkSync(sampleImagePath);
      } catch {}
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
  // 3. Guest Crop Check Flow (No Login Required)
  // ---------------------------------------------------------------------------
  describe('Guest Crop Check Flow', () => {
    test('POST /api/scans/upload should allow a guest to upload a leaf photo without token', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .attach('image', sampleImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scan.id).toBeDefined();
      expect(res.body.data.scan.user_id).toBeNull();
      expect(res.body.data.scan.status).toBe('uploaded');

      guestScanId = res.body.data.scan.id;
    });

    test('POST /api/scans/:id/analyze should execute AI analysis directly to complete assessment without questions', async () => {
      const res = await request(app)
        .post(`/api/scans/${guestScanId}/analyze`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment.crop).toBeDefined();
      expect(res.body.data.assessment.condition).toBeDefined();
      expect(res.body.data.assessment.what_we_found).toBeDefined();
      expect(res.body.data.action_plan).toBeDefined();
      expect(res.body.data.action_plan.immediate_actions.length).toBeGreaterThan(0);
      expect(res.body.data.action_plan.prevention_steps.length).toBeGreaterThan(0);
      expect(res.body.data.action_plan.monitoring_steps.length).toBeGreaterThan(0);
      expect(res.body.data.scan.status).toBe('completed');
    }, 30000);

    test('GET /api/scans/:id should allow guest to view the complete result snapshot', async () => {
      const res = await request(app).get(`/api/scans/${guestScanId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.scan.id).toBe(guestScanId);
      expect(res.body.data.action_plan).toBeDefined();
      expect(res.body.data.evidence.visual.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Claim Scan / Save to User Account Flow
  // ---------------------------------------------------------------------------
  describe('Claim Scan into User Account', () => {
    test('POST /api/scans/:id/claim should save guest scan to User A account', async () => {
      const res = await request(app)
        .post(`/api/scans/${guestScanId}/claim`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scan.user_id).toBe(userAId);
    });

    test('GET /api/scans should now list the claimed scan in User A history', async () => {
      const res = await request(app)
        .get('/api/scans')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.scans.some((s) => s.id === guestScanId)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. User Ownership Isolation Guardrails
  // ---------------------------------------------------------------------------
  describe('Ownership Isolation Safeguards', () => {
    test('User B should NOT see User A scan in their Scan History', async () => {
      const res = await request(app)
        .get('/api/scans')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.scans.some((s) => s.id === guestScanId)).toBe(false);
    });

    test('User B should NOT be able to access User A scan details by ID', async () => {
      const res = await request(app)
        .get(`/api/scans/${guestScanId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('User B should NOT be able to claim a scan already owned by User A', async () => {
      const res = await request(app)
        .post(`/api/scans/${guestScanId}/claim`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Authenticated Re-scan & Qualitative Comparison
  // ---------------------------------------------------------------------------
  describe('Re-Scan & Comparison Workflow', () => {
    test('User A should upload a follow-up scan referencing baseline scan', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('parent_scan_id', guestScanId)
        .attach('image', sampleImagePath);

      expect(res.status).toBe(201);
      expect(res.body.data.scan.parent_scan_id).toBe(guestScanId);
      expect(res.body.data.scan.user_id).toBe(userAId);

      followupScanId = res.body.data.scan.id;
    });

    test('POST /api/scans/:id/compare should return trajectory comparison', async () => {
      const res = await request(app)
        .post(`/api/scans/${guestScanId}/compare`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ followup_scan_id: followupScanId });

      expect(res.status).toBe(201);
      expect(res.body.data.comparison.trajectory).toBeDefined();
      expect(res.body.data.comparison.comparison_summary).toBeDefined();
    });
  });
});
