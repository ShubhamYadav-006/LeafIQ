# Phase 2 — LeafIQ Backend + Database Implementation Report

**Status**: ✅ COMPLETED & VERIFIED  
**Date**: September 5, 2026  
**Target Environment**: Node.js v22.x, Express.js v4.21.2, PostgreSQL 18.0, Python 3.11 (Phase 1 AI Module)

---

## 1. Backend Architecture Implemented

The LeafIQ backend follows a modular layer separation pattern inside `server/`:

```
server/
├── migrations/
│   └── 001_initial_schema.sql
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool with transaction helper
│   ├── controllers/              # HTTP Request handlers
│   │   ├── authController.js
│   │   ├── scanController.js
│   │   ├── questionController.js
│   │   ├── assessmentController.js
│   │   └── comparisonController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT Bearer token authentication guard
│   │   ├── upload.js             # Multer 10MB JPG/PNG/WEBP upload validator
│   │   └── errorHandler.js       # Centralized error handler & response standardizer
│   ├── migrations/
│   │   └── run_migrations.js     # Programmatic migration runner script
│   ├── repositories/             # Database access abstractions
│   │   ├── userRepository.js
│   │   ├── scanRepository.js
│   │   ├── evidenceRepository.js
│   │   ├── questionRepository.js
│   │   ├── answerRepository.js
│   │   ├── alternativeRepository.js
│   │   ├── actionPlanRepository.js
│   │   └── comparisonRepository.js
│   ├── routes/                   # Express routes
│   │   ├── authRoutes.js
│   │   ├── scanRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── assessmentRoutes.js
│   │   └── comparisonRoutes.js
│   ├── seeds/
│   │   └── seed.js               # Development seed script (farmer@leafiq.org)
│   ├── services/                 # Domain & business logic
│   │   ├── aiBridgeService.js            # Python AI process caller & validator
│   │   ├── questionEngineService.js      # Smart questions generator
│   │   ├── assessmentSynthesisService.js # Assessment & Action plan synthesizer
│   │   └── comparisonEngineService.js   # Qualitative trajectory comparison engine
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── jwt.js
│   │   └── password.js
│   ├── validators/               # Zod input validation schemas
│   │   ├── authValidator.js
│   │   └── scanValidator.js
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # Entry point & HTTP server
├── tests/
│   └── api.test.js               # Automated integration tests
├── uploads/                      # Uploaded image directory
├── API_DOCUMENTATION.md          # Comprehensive API guide & endpoints
├── FRONTEND_CONTRACT.md          # Frontend integration spec
└── package.json
```

---

## 2. Database Tables Implemented

Implemented strictly per `Database.md` on PostgreSQL 18:

1. **`users`**: UUID primary key, unique email, bcrypt password hash, timestamps.
2. **`scans`**: UUID primary key, foreign key to `users`, image metadata, initial/final condition & confidence (CHECK range 0–1), concern level ENUM (`Healthy`, `Monitor`, `Attention Recommended`, `High Concern`, `Uncertain`), status ENUM, self-referential foreign key for `parent_scan_id`.
3. **`evidence`**: FK to `scans`, source ENUM (`visual`, `farmer_reported`), description.
4. **`smart_questions`**: FK to `scans`, question key, question text, display order, JSONB options array.
5. **`answers`**: FK to `scans`, FK to `smart_questions`, JSONB selected options array.
6. **`alternative_possibilities`**: FK to `scans`, condition name, confidence (0-1), reasoning.
7. **`action_plans`**: FK to `scans`, JSONB arrays for immediate actions, monitoring, prevention, expert guidance text, disclaimer text.
8. **`scan_comparisons`**: FK to `scans` (baseline & followup), trajectory ENUM (`improving`, `stable`, `worsening`, `unclear`), comparison summary.

Indexes created on all foreign keys (`user_id`, `scan_id`, `parent_scan_id`) and timestamp columns.

---

## 3. API Endpoints Created

| Category | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **System** | `/api/health` | `GET` | Health check & PostgreSQL connection status |
| **Auth** | `/api/auth/register` | `POST` | Create farmer account & return JWT |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user & return JWT |
| **Auth** | `/api/auth/me` | `GET` | Retrieve current authenticated user |
| **Scan** | `/api/scans/upload` | `POST` | Upload leaf image & create scan |
| **Scan** | `/api/scans/:id/analyze` | `POST` | Run AI validation, prediction & initial assessment |
| **Scan** | `/api/scans/:id` | `GET` | Retrieve complete scan snapshot |
| **Scan** | `/api/scans` | `GET` | List user's historical scans |
| **Questions** | `/api/scans/:id/questions` | `GET` | Retrieve smart follow-up questions |
| **Questions** | `/api/scans/:id/answers` | `POST` | Submit farmer answers to questions |
| **Assessment**| `/api/scans/:id/finalize` | `POST` | Synthesize final assessment, evidence & action plan |
| **Comparison**| `/api/scans/:id/compare` | `POST` | Create qualitative trajectory comparison |

---

## 4. Technical Specifications & Approaches

### Authentication
- Uses `jsonwebtoken` with 7-day expiration.
- Passwords hashed using `bcryptjs` with salt rounds = 10.
- All protected endpoints enforce scan ownership isolation: `scan.user_id === req.user.id`.

### Image Handling & Technical Validation
- `multer` handles file uploads with max file size limit (10MB) and strict MIME type checking (`image/jpeg`, `image/png`, `image/webp`).
- Unique filename generated using `timestamp-uuid.ext` to prevent path traversal and file overwrites.
- Technical validation via Python OpenCV checks resolution (min 64x64px), focus sharpness (Laplacian variance >= 35.0), and plant leaf color foliage content (ExG >= 0.08).

### AI Integration
- `aiBridgeService.js` spawns Python child process running Phase 1 AI module (`ai/scripts/predict.py`).
- Parses structured JSON response and validates schema before database persistence.
- Handles edge cases: invalid image, unsupported plant species, low confidence scores.

---

## 5. Automated Test Results

Executed complete integration test suite in `server/tests/api.test.js`:

```
PASS  tests/api.test.js (6.064 s)
  LeafIQ Backend API Integration Tests
    √ GET /api/health should return status ok and connected DB (29 ms)
    Authentication API
      √ POST /api/auth/register should create User A and return JWT (100 ms)
      √ POST /api/auth/register should create User B (80 ms)
      √ POST /api/auth/login should authenticate User A with valid credentials (68 ms)
      √ POST /api/auth/login should reject invalid password (80 ms)
      √ GET /api/auth/me should return authenticated profile (5 ms)
      √ GET /api/auth/me should reject request without token (12 ms)
    Scan Upload & AI Validation
      √ POST /api/scans/upload should upload photo and create scan for User A (17 ms)
      √ POST /api/scans/:id/analyze should execute AI analysis and return initial findings + questions (4152 ms)
    Smart Questions & Farmer Answers
      √ GET /api/scans/:id/questions should retrieve questions for scan (6 ms)
      √ POST /api/scans/:id/answers should submit farmer answers (10 ms)
    Final Assessment Synthesis & Action Plan
      √ POST /api/scans/:id/finalize should synthesize final assessment & action plan (16 ms)
      √ GET /api/scans/:id should return complete scan snapshot (10 ms)
    Ownership Isolation Safeguards
      √ User B should NOT be able to access User A scan details (8 ms)
      √ User B should NOT be able to submit answers for User A scan (8 ms)
    Re-Scan & Comparison Workflow
      √ User A should create a follow-up scan referencing baseline scan (8 ms)
      √ POST /api/scans/:id/compare should return qualitative trajectory comparison (8 ms)

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        6.136 s
```

---

## 6. Definition of Done Checklist

- [x] PostgreSQL configured
- [x] Database migrations work from a clean database
- [x] All 8 required tables exist (`users`, `scans`, `evidence`, `smart_questions`, `answers`, `alternative_possibilities`, `action_plans`, `scan_comparisons`)
- [x] Constraints and indexes implemented
- [x] Backend server runs successfully
- [x] Authentication works (register, login, JWT token verification)
- [x] Protected routes work with scan ownership checks
- [x] Image upload works with file type and size validation
- [x] Image validation integrated (sharpness, color, resolution)
- [x] Phase 1 AI module integrated via Python bridge
- [x] Initial assessment generated correctly
- [x] Visual and farmer-reported evidence stored separately
- [x] Smart questions generated based on initial findings
- [x] Farmer answers stored correctly in database
- [x] Final assessment synthesis implemented
- [x] Action plan stored with conservative guidance & disclaimers
- [x] Scan history API lists user's scans
- [x] User ownership enforced across all scan routes
- [x] Re-scan relationship (`parent_scan_id`) supported
- [x] Qualitative comparison (`improving`, `stable`, `worsening`, `unclear`) implemented
- [x] Centralized error handling returns consistent JSON envelopes
- [x] Critical APIs covered by Jest integration tests (17/17 passing)
- [x] `.env.example` exists
- [x] API documentation (`API_DOCUMENTATION.md`) & Frontend contract (`FRONTEND_CONTRACT.md`) exist
- [x] No secrets committed
- [x] Ready for Phase 3 frontend implementation

---

## 7. Commands to Run the Backend

```bash
# Navigate to server folder
cd server

# Install dependencies (if needed)
npm install

# Run database migrations
node src/migrations/run_migrations.js

# Seed default test user (farmer@leafiq.org / farmer123)
node src/seeds/seed.js

# Run integration test suite
$env:NODE_OPTIONS="--experimental-vm-modules"; node node_modules/jest/bin/jest.js tests/api.test.js --forceExit

# Start Express server
npm run dev
```

---

## 8. Phase 3 Readiness

**YES, Phase 2 is 100% READY for Phase 3 (React Frontend Implementation).**
