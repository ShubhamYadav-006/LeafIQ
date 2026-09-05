# LeafIQ Backend API Documentation

This document provides a comprehensive overview of the LeafIQ Express.js backend API, setup instructions, environment configuration, database migration commands, and detailed request/response examples.

---

## 1. Setup & Environment Configuration

### Prerequisites
- **Node.js**: v18+ (verified on v22.x)
- **PostgreSQL**: v14+ (verified on PostgreSQL 18.0)
- **Python**: v3.11+ with `torch`, `torchvision`, `Pillow`, `opencv-python` installed (for Phase 1 AI module inference).

### Environment Variables
Copy `.env.example` to `.env` in the `server/` directory:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/leafiq_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leafiq_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=20
DB_IDLE_TIMEOUT_MS=30000

# Security / Authentication
JWT_SECRET=leafiq_jwt_super_secret_hackathon_key_2026
JWT_EXPIRES_IN=7d

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# AI Service / Python Inference
PYTHON_PATH=C:\Users\Parth Gautam\AppData\Local\Programs\Python311\python.exe
AI_SCRIPT_PATH=../ai/scripts/predict.py
AI_MODEL_PATH=../ai/models/model.pth
AI_LABEL_MAP_PATH=../ai/models/label_map.json
AI_TIMEOUT_MS=30000
```

---

## 2. Database Commands

### Create Database
```bash
psql -U postgres -c "CREATE DATABASE leafiq_db;"
```

### Run Migrations
```bash
# From server directory
node src/migrations/run_migrations.js
```

### Seed Development Data
```bash
# Seeds default test user farmer@leafiq.org / farmer123
node src/seeds/seed.js
```

### Run Integration Tests
```bash
$env:NODE_OPTIONS="--experimental-vm-modules"; node node_modules/jest/bin/jest.js tests/api.test.js --forceExit
```

---

## 3. Server Operations

### Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 4. API Endpoints Overview

All response payloads follow the standardized JSON envelope:
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Description", "details": null } }`

---

### Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Register a new farmer account.
- **Request Body**:
  ```json
  {
    "email": "farmer@example.com",
    "password": "securepassword123",
    "full_name": "Ramesh Kumar"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f7a02b-8a8b-4a57-b50b-8d7b8cfd2a10",
        "email": "farmer@example.com",
        "full_name": "Ramesh Kumar",
        "role": "farmer",
        "created_at": "2026-09-05T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

#### `POST /api/auth/login`
Authenticate existing user and obtain Bearer JWT.
- **Request Body**:
  ```json
  {
    "email": "farmer@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f7a02b-8a8b-4a57-b50b-8d7b8cfd2a10",
        "email": "farmer@example.com",
        "full_name": "Ramesh Kumar",
        "role": "farmer"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

#### `GET /api/auth/me`
Retrieve authenticated user profile.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f7a02b-8a8b-4a57-b50b-8d7b8cfd2a10",
        "email": "farmer@example.com",
        "full_name": "Ramesh Kumar",
        "role": "farmer"
      }
    }
  }
  ```

---

### Scan Operations (`/api/scans`)

#### `POST /api/scans/upload`
Upload leaf image file and create an initial scan record in `uploaded` status.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
- **Body**:
  - `image`: Binary file (JPG/PNG/WEBP, max 10MB)
  - `parent_scan_id` *(optional)*: UUID of baseline scan for follow-up comparison
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "scan": {
        "id": "e4f8b912-9c12-4d22-a912-efab34567890",
        "user_id": "c1f7a02b-8a8b-4a57-b50b-8d7b8cfd2a10",
        "image_path": "uploads/1757068500000-a1b2c3.jpg",
        "status": "uploaded",
        "parent_scan_id": null
      }
    }
  }
  ```

#### `POST /api/scans/:id/analyze`
Execute image validation and AI inference engine for the scan.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "scan_id": "e4f8b912-9c12-4d22-a912-efab34567890",
      "status": "analyzed",
      "initial_assessment": {
        "crop": "Tomato",
        "crop_confidence": 0.98,
        "initial_condition": "Late Blight",
        "initial_confidence": 0.89,
        "concern_level": "Attention Recommended",
        "supported": true
      },
      "questions": [
        {
          "id": "q-101",
          "question_key": "symptom_location",
          "question_text": "Where are the spots located on the plant?",
          "display_order": 1,
          "options": ["Older leaves near the bottom", "Younger leaves at the top", "Stems or fruit"]
        }
      ]
    }
  }
  ```

#### `GET /api/scans/:id/questions`
Retrieve smart follow-up questions generated for the scan.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "scan_id": "e4f8b912-9c12-4d22-a912-efab34567890",
      "questions": [...]
    }
  }
  ```

#### `POST /api/scans/:id/answers`
Submit farmer responses to smart questions.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:
  ```json
  {
    "answers": [
      {
        "question_id": "q-101",
        "selected_options": ["Older leaves near the bottom"]
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "scan_id": "e4f8b912-9c12-4d22-a912-efab34567890",
      "answers": [...]
    }
  }
  ```

#### `POST /api/scans/:id/finalize`
Synthesize initial AI assessment + farmer answers into final assessment, evidence, and tiered action plan.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "scan": {
        "id": "e4f8b912-9c12-4d22-a912-efab34567890",
        "status": "completed",
        "final_condition": "Late Blight",
        "final_confidence": 0.89,
        "concern_level": "Attention Recommended"
      },
      "evidence": {
        "visual": ["Dark water-soaked lesions observed on leaves"],
        "farmer_reported": ["Symptoms present on older bottom leaves"]
      },
      "action_plan": {
        "immediate_actions": ["Prune heavily infected lower leaves and destroy them"],
        "monitoring_steps": ["Inspect neighboring plants every 48 hours for lesion expansion"],
        "prevention_steps": ["Ensure proper spacing and apply copper-based fungicide according to local guidance"],
        "expert_guidance": "Consult your local krishi vigyan kendra (KVK) if spreading rapidly.",
        "disclaimer": "LeafIQ provides AI-assisted guidance and does not replace certified agronomist diagnosis."
      }
    }
  }
  ```

#### `GET /api/scans/:id`
Retrieve complete historical snapshot of a scan including crop details, initial/final assessments, evidence, questions, answers, and action plan.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### `GET /api/scans`
List authenticated user's scan history ordered newest first.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### `POST /api/scans/:id/compare`
Perform qualitative trajectory comparison between baseline scan (`:id`) and follow-up scan.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**: `{ "followup_scan_id": "<FOLLOWUP_SCAN_UUID>" }`
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "comparison": {
        "id": "comp-123",
        "baseline_scan_id": "...",
        "followup_scan_id": "...",
        "trajectory": "improving",
        "comparison_summary": "Condition has stabilized. Lesion progression slowed down."
      }
    }
  }
  ```

---

## 5. Error Codes & HTTP Status Matrix

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Invalid payload, query parameters, or missing required fields |
| `IMAGE_INVALID` | 400 | Image failed technical validation (blurry, non-leaf, small) |
| `INVALID_FILE_TYPE` | 400 | Unsupported MIME type (only JPG/PNG/WEBP permitted) |
| `UNAUTHORIZED` | 401 | Missing, malformed, or expired JWT authorization header |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `NOT_FOUND` | 404 | Scan or resource not found or access denied for authenticated user |
| `CONFLICT` | 409 | User registration email already exists |
| `AI_SERVICE_ERROR` | 500 | Python AI inference bridge failed or timed out |
| `INTERNAL_ERROR` | 500 | Unexpected server fault |
