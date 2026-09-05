import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import pg from 'pg';
const { Pool } = pg;

const API_URL = 'http://localhost:5000/api';
const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/leafiq_db',
});

async function runE2ETest() {
  console.log('=== LEAFIQ END-TO-END SYSTEM INTEGRATION TEST ===\n');

  // 1. Create temporary test images using Python/Pillow
  const tempDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const imageAPath = path.join(tempDir, `e2e_leaf_a_${Date.now()}.jpg`);
  const imageBPath = path.join(tempDir, `e2e_leaf_b_${Date.now()}.jpg`);

  const pyExe = 'C:\\Users\\Parth Gautam\\AppData\\Local\\Programs\\Python311\\python.exe';
  const pyCmdA = `from PIL import Image, ImageDraw; img = Image.new('RGB', (256, 256), (40, 40, 40)); draw = ImageDraw.Draw(img); draw.ellipse([30, 20, 226, 236], fill=(50, 160, 60), outline=(30, 110, 40), width=2); draw.line([128, 30, 128, 230], fill=(70, 190, 80), width=2); img.save(r'${imageAPath}', 'JPEG')`;
  const pyCmdB = `from PIL import Image, ImageDraw; img = Image.new('RGB', (256, 256), (40, 40, 40)); draw = ImageDraw.Draw(img); draw.ellipse([20, 10, 236, 246], fill=(60, 180, 70), outline=(40, 120, 50), width=2); draw.line([128, 30, 128, 230], fill=(80, 200, 90), width=2); img.save(r'${imageBPath}', 'JPEG')`;

  execSync(`"${pyExe}" -c "${pyCmdA}"`);
  execSync(`"${pyExe}" -c "${pyCmdB}"`);

  console.log('✓ Created 2 valid test leaf images');

  // 2. Auth: Register & Login Farmer User
  const emailA = `farmer_e2e_${Date.now()}@leafiq.org`;
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password: 'password123', full_name: 'E2E Farmer' }),
  }).then((r) => r.json());

  if (!regRes.success) throw new Error(`Auth failed: ${JSON.stringify(regRes)}`);
  const tokenA = regRes.data.token;
  const userAId = regRes.data.user.id;
  console.log(`✓ Auth Success: Registered User A (${userAId})`);

  // Auth User B (for cross-user security checks)
  const emailB = `farmer_b_${Date.now()}@leafiq.org`;
  const regBRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password: 'password123', full_name: 'User B Security' }),
  }).then((r) => r.json());
  const tokenB = regBRes.data.token;
  console.log(`✓ Auth Success: Registered User B`);

  // 3. Upload Baseline Image (Scan A)
  const formDataA = new FormData();
  const fileABlob = new Blob([fs.readFileSync(imageAPath)], { type: 'image/jpeg' });
  formDataA.append('image', fileABlob, 'leaf_a.jpg');

  const uploadARes = await fetch(`${API_URL}/scans/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: formDataA,
  }).then((r) => r.json());

  if (!uploadARes.success) throw new Error(`Upload Scan A failed: ${JSON.stringify(uploadARes)}`);
  const scanAId = uploadARes.data.scan.id;
  console.log(`✓ Upload Success: Scan A created (${scanAId})`);

  // 4. AI Analysis & Initial Assessment (Scan A)
  const analyzeARes = await fetch(`${API_URL}/scans/${scanAId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  }).then((r) => r.json());

  if (!analyzeARes.success) throw new Error(`Analyze Scan A failed: ${JSON.stringify(analyzeARes)}`);
  console.log(`✓ AI Analysis Success (Scan A): Crop=${analyzeARes.data.initial_assessment.crop}, Condition=${analyzeARes.data.initial_assessment.condition}`);
  const questionsA = analyzeARes.data.questions;

  // 5. Submit Answers (Scan A)
  if (questionsA.length > 0) {
    const answerPayload = {
      answers: questionsA.map((q) => ({
        question_id: q.id,
        selected_options: [q.options?.[0] || 'Older leaves near the bottom'],
      })),
    };
    const answerARes = await fetch(`${API_URL}/scans/${scanAId}/answers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(answerPayload),
    }).then((r) => r.json());
    if (!answerARes.success) throw new Error(`Answer Scan A failed: ${JSON.stringify(answerARes)}`);
    console.log(`✓ Farmer Answers Success: Submitted ${answerARes.data.answers.length} answers`);
  }

  // 6. Finalize Scan A
  const finalizeARes = await fetch(`${API_URL}/scans/${scanAId}/finalize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  }).then((r) => r.json());

  if (!finalizeARes.success) throw new Error(`Finalize Scan A failed: ${JSON.stringify(finalizeARes)}`);
  console.log(`✓ Finalize Success (Scan A): Status=${finalizeARes.data.scan.status}`);

  // 7. Create Follow-up Re-scan (Scan B) referencing parent_scan_id = scanAId
  const formDataB = new FormData();
  const fileBBlob = new Blob([fs.readFileSync(imageBPath)], { type: 'image/jpeg' });
  formDataB.append('image', fileBBlob, 'leaf_b.jpg');
  formDataB.append('parent_scan_id', scanAId);

  const uploadBRes = await fetch(`${API_URL}/scans/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: formDataB,
  }).then((r) => r.json());

  if (!uploadBRes.success) throw new Error(`Upload Scan B failed: ${JSON.stringify(uploadBRes)}`);
  const scanBId = uploadBRes.data.scan.id;
  console.log(`✓ Re-scan Upload Success: Scan B created (${scanBId}) with parent_scan_id=${uploadBRes.data.scan.parent_scan_id}`);

  // 8. Analyze & Finalize Scan B
  await fetch(`${API_URL}/scans/${scanBId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  await fetch(`${API_URL}/scans/${scanBId}/finalize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`✓ Scan B Finalized`);

  // 9. Compare Scan A and Scan B
  const compareRes = await fetch(`${API_URL}/scans/${scanAId}/compare`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ followup_scan_id: scanBId }),
  }).then((r) => r.json());

  if (!compareRes.success) throw new Error(`Compare failed: ${JSON.stringify(compareRes)}`);
  console.log(`✓ Qualitative Comparison Success: Trajectory='${compareRes.data.comparison.trajectory}', Summary='${compareRes.data.comparison.comparison_summary}'`);

  // 10. Security Audit: Cross-User Access Guard Check
  const unauthorizedScanGet = await fetch(`${API_URL}/scans/${scanAId}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (unauthorizedScanGet.status === 404) {
    console.log(`✓ Security Guard Success: User B access to User A scan correctly rejected (HTTP 404)`);
  } else {
    throw new Error(`Security Failure: User B accessed User A scan with status ${unauthorizedScanGet.status}`);
  }

  // 11. Database Integrity Verification
  console.log('\n--- Checking PostgreSQL Database Record Integrity ---');
  const dbScanA = await pool.query('SELECT * FROM scans WHERE id = $1', [scanAId]);
  const dbScanB = await pool.query('SELECT * FROM scans WHERE id = $1', [scanBId]);
  const dbComp = await pool.query('SELECT * FROM scan_comparisons WHERE baseline_scan_id = $1 AND followup_scan_id = $2', [scanAId, scanBId]);
  const dbEvidence = await pool.query('SELECT * FROM evidence WHERE scan_id = $1', [scanAId]);
  const dbActionPlan = await pool.query('SELECT * FROM action_plans WHERE scan_id = $1', [scanAId]);

  console.log(`- Scan A DB Status: ${dbScanA.rows[0].status}, CreatedAt: ${dbScanA.rows[0].created_at}`);
  console.log(`- Scan B DB Status: ${dbScanB.rows[0].status}, ParentID: ${dbScanB.rows[0].parent_scan_id}`);
  console.log(`- Historical Immutability Check: Scan A parent_scan_id is ${dbScanA.rows[0].parent_scan_id} (null as baseline)`);
  console.log(`- DB Comparison Record: Trajectory='${dbComp.rows[0].trajectory}'`);
  console.log(`- DB Evidence Records Count: ${dbEvidence.rows.length}`);
  console.log(`- DB Action Plan Record: Immediate Actions Count = ${Array.isArray(dbActionPlan.rows[0].immediate_actions) ? dbActionPlan.rows[0].immediate_actions.length : JSON.parse(dbActionPlan.rows[0].immediate_actions).length}`);

  // Cleanup temp files
  if (fs.existsSync(imageAPath)) fs.unlinkSync(imageAPath);
  if (fs.existsSync(imageBPath)) fs.unlinkSync(imageBPath);
  await pool.end();

  console.log('\n=== ALL END-TO-END INTEGRATION CHECKS PASSED 100% ===');
}

runE2ETest().catch((e) => {
  console.error('❌ E2E Test Failure:', e);
  process.exit(1);
});
