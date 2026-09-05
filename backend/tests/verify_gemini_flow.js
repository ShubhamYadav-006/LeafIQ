import { AiBridgeService } from '../src/services/ai.service.js';
import { pool } from '../src/config/database.js';

const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function runGeminiIntegrationTests() {
  console.log('====================================================');
  console.log('🧪 LEAFIQ GEMINI AI INTEGRATION VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST SET A: Parser & Schema Strictness Tests
  // ----------------------------------------------------
  console.log('[1/4] Testing Structured Response Parser & Schema Rules...');

  // TEST 1: Disease Assessment Response
  const diseasePayload = JSON.stringify({
    image_valid: true,
    plant_detected: true,
    crop: { name: 'Tomato', confidence: 'High' },
    assessment: {
      status: 'possible_problem',
      problem: 'Early Blight',
      confidence: 'Medium',
      concern_level: 'Attention Recommended',
    },
    visual_evidence: [
      'Dark concentric lesions visible on leaf blade',
      'Yellow chlorotic halos surrounding affected areas',
    ],
    description: 'Visual inspection reveals irregular brown-to-black necrotic lesions with yellow chlorotic halos, characteristic of early fungal infection.',
    how_to_fix: [
      'Remove severely affected leaves where appropriate',
      'Improve airflow around the plants',
      'Avoid unnecessary leaf wetness',
    ],
    prevention: [
      'Monitor nearby leaves for new symptoms',
      'Maintain adequate spacing and airflow',
      'Remove infected plant material appropriately',
    ],
    what_to_monitor: [
      'Increase in lesion size',
      'Appearance of new affected leaves',
      'Overall plant vigor',
    ],
    alternative_possibilities: [
      {
        problem: 'Septoria Leaf Spot',
        confidence: 'Low',
        rationale: 'Shows similar spotting pattern but with smaller gray centers.',
      },
    ],
    disclaimer: 'This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis.',
  });

  const parsedDisease = AiBridgeService._parseAndValidateGeminiResponse(diseasePayload);
  assert(parsedDisease.image_valid === true, 'Disease payload marked image_valid = true');
  assert(parsedDisease.crop.name === 'Tomato', 'Detected crop is Tomato');
  assert(parsedDisease.crop.confidence === 'High', 'Crop confidence is qualitative High');
  assert(parsedDisease.assessment.status === 'possible_problem', 'Assessment status is possible_problem');
  assert(parsedDisease.assessment.problem === 'Early Blight', 'Problem is Early Blight');
  assert(parsedDisease.assessment.confidence === 'Medium', 'Assessment confidence is qualitative Medium');
  assert(parsedDisease.visual_evidence.length === 2, 'Visual evidence contains 2 items');
  assert(parsedDisease.how_to_fix.length === 3, 'How to fix contains 3 items');
  assert(parsedDisease.prevention.length === 3, 'Prevention contains 3 items');
  assert(parsedDisease.what_to_monitor.length === 3, 'What to monitor contains 3 items');
  assert(parsedDisease.alternative_possibilities.length === 1, 'Alternative possibilities contains 1 item');

  // TEST 2: Healthy Leaf Response
  const healthyPayload = JSON.stringify({
    image_valid: true,
    plant_detected: true,
    crop: { name: 'Tomato', confidence: 'High' },
    assessment: {
      status: 'healthy',
      problem: null,
      confidence: 'High',
      concern_level: 'Low',
    },
    visual_evidence: [
      'Leaves appear generally green and intact',
      'No obvious disease lesions are visible',
    ],
    description: 'The visible leaf appears generally healthy based on the submitted image.',
    how_to_fix: [],
    prevention: ['Continue regular crop monitoring'],
    what_to_monitor: ['New spots, discoloration, wilting, or abnormal growth'],
    alternative_possibilities: [],
    disclaimer: 'This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis.',
  });

  const parsedHealthy = AiBridgeService._parseAndValidateGeminiResponse(healthyPayload);
  assert(parsedHealthy.image_valid === true, 'Healthy payload marked image_valid = true');
  assert(parsedHealthy.assessment.status === 'healthy', 'Assessment status is healthy');
  assert(parsedHealthy.assessment.problem === null, 'Problem is null for healthy plant');
  assert(parsedHealthy.assessment.concern_level === 'Low', 'Concern level is Low for healthy plant');
  assert(parsedHealthy.how_to_fix.length === 0, 'How to fix is empty for healthy plant');

  // TEST 3: Invalid / Unclear / Blurry Image Response
  const invalidPayload = JSON.stringify({
    image_valid: false,
    plant_detected: false,
    crop: null,
    assessment: {
      status: 'insufficient_image',
      problem: null,
      confidence: 'Low',
      concern_level: 'Unable to Assess',
    },
    visual_evidence: [],
    description: 'The submitted image does not provide enough clear visual information for a reliable crop-health assessment.',
    how_to_fix: [],
    prevention: [],
    what_to_monitor: [],
    alternative_possibilities: [],
    disclaimer: 'Please upload a clear image of the crop leaf.',
  });

  const parsedInvalid = AiBridgeService._parseAndValidateGeminiResponse(invalidPayload);
  assert(parsedInvalid.image_valid === false, 'Invalid image marked image_valid = false');
  assert(parsedInvalid.crop === null, 'Crop is null when image is invalid');
  assert(parsedInvalid.assessment.status === 'insufficient_image', 'Assessment status is insufficient_image');
  assert(parsedInvalid.assessment.concern_level === 'Unable to Assess', 'Concern level is Unable to Assess');

  // TEST 4: Markdown Fenced JSON Stripping
  const fencedPayload = '```json\n' + diseasePayload + '\n```';
  const parsedFenced = AiBridgeService._parseAndValidateGeminiResponse(fencedPayload);
  assert(parsedFenced.image_valid === true, 'Markdown code fence stripped successfully');

  // ----------------------------------------------------
  // TEST SET B: Live Health & Database Connection
  // ----------------------------------------------------
  console.log('\n[2/4] Testing Live Backend Health & Database...');

  try {
    const healthRes = await fetch(`${API_URL}/health`).then((r) => r.json());
    assert(healthRes.status === 'ok', 'Health endpoint returns status: ok');
    assert(healthRes.database === 'connected', 'PostgreSQL database connected');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SET C: Upload Endpoint Security & Error Handling
  // ----------------------------------------------------
  console.log('\n[3/4] Testing Upload Endpoint & In-Memory Handling...');

  try {
    // Missing file check
    const emptyUploadRes = await fetch(`${API_URL}/scans/upload`, {
      method: 'POST',
      body: new FormData(),
    }).then((r) => r.json());

    assert(
      emptyUploadRes.success === false && emptyUploadRes.error?.code === 'MISSING_FILE',
      'Upload rejected when no image is provided'
    );

    // Unsupported format check (e.g. text file as image)
    const textBlob = new Blob(['hello text'], { type: 'text/plain' });
    const badForm = new FormData();
    badForm.append('image', textBlob, 'notes.txt');

    const badTypeRes = await fetch(`${API_URL}/scans/upload`, {
      method: 'POST',
      body: badForm,
    }).then((r) => r.json());

    assert(
      badTypeRes.success === false && badTypeRes.error?.code === 'INVALID_FILE_TYPE',
      'Upload rejected when file format is not JPG, PNG, or WEBP'
    );
  } catch (err) {
    assert(false, `Upload security tests failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SET D: Database Operations & User Isolation
  // ----------------------------------------------------
  console.log('\n[4/4] Testing Guest Scan Persistence & Claim Security...');

  try {
    // 1. Create a guest scan in DB directly
    const testScanRes = await pool.query(
      `INSERT INTO scans (image_url, original_filename, file_size_bytes, mime_type, status)
       VALUES ('data:image/jpeg;base64,dGVzdA==', 'test_leaf.jpg', 1024, 'image/jpeg', 'completed')
       RETURNING *`
    );
    const guestScan = testScanRes.rows[0];
    assert(guestScan.user_id === null, 'Guest scan created without user_id');

    // 2. Fetch guest scan via API without auth
    const fetchGuestRes = await fetch(`${API_URL}/scans/${guestScan.id}`).then((r) => r.json());
    assert(fetchGuestRes.success === true, 'Guest can view own unassigned scan without login');

    // 3. Register user and claim scan
    const testUserEmail = `gemini_test_${Date.now()}@leafiq.org`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'password123', full_name: 'Test Farmer' }),
    }).then((r) => r.json());

    const userToken = regRes.data?.token;
    assert(Boolean(userToken), 'Registered user successfully for scan claim');

    // Claim the guest scan
    const claimRes = await fetch(`${API_URL}/scans/${guestScan.id}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((r) => r.json());

    assert(claimRes.success === true, 'Authenticated user claimed guest scan');

    // 4. Verify user scan history contains claimed scan
    const historyRes = await fetch(`${API_URL}/scans`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((r) => r.json());

    const scanFound = historyRes.data?.scans?.some((s) => s.id === guestScan.id);
    assert(scanFound === true, 'Claimed scan appears in user scan history');

    // Clean up test scan and user
    await pool.query('DELETE FROM scans WHERE id = $1', [guestScan.id]);
    await pool.query('DELETE FROM users WHERE email = $1', [testUserEmail]);
  } catch (err) {
    assert(false, `Database test failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runGeminiIntegrationTests().catch(async (err) => {
  console.error('Test suite uncaught error:', err);
  await pool.end();
  process.exit(1);
});
