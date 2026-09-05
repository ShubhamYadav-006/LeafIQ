# LeafIQ Frontend Integration Contract

This document provides explicit details for the Phase 3 React frontend developer to seamlessly connect the UI to the LeafIQ Node/Express + PostgreSQL backend without guesswork.

---

## 1. Core Workflow State Machine

The backend enforces a deterministic scan state lifecycle:

```
[Upload Photo] ──> Status: 'uploaded'
       │
       ▼
 [Run Analysis] ──> Status: 'analyzed' (returns Initial Assessment + Smart Questions)
       │
       ▼
 [Submit Answers] ──> Status: 'answered' (persists Farmer Answers)
       │
       ▼
 [Finalize Scan] ──> Status: 'completed' (returns Final Assessment + Action Plan + Evidence)
```

---

## 2. Step-by-Step API Integration Guide

### Step 1: Authentication
Store JWT token in `localStorage` or `sessionStorage`. Include header `Authorization: Bearer <TOKEN>` in all subsequent scan requests.

- **Login Endpoint**: `POST /api/auth/login`
- **Register Endpoint**: `POST /api/auth/register`
- **Session Check**: `GET /api/auth/me`

---

### Step 2: Upload Leaf Photo
- **Endpoint**: `POST /api/scans/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `image`: File object
  - `parent_scan_id` *(optional string)*: UUID of baseline scan if user is performing a re-scan.
- **On Success**: Save `data.scan.id` as `currentScanId`.

---

### Step 3: Trigger AI Analysis & Fetch Smart Questions
- **Endpoint**: `POST /api/scans/:id/analyze`
- **Method**: `POST`
- **URL Parameter**: `:id` = `currentScanId`
- **UI Handling**:
  - Render **Initial Assessment Card**: Crop Name, Initial Condition, Confidence %, Concern Level tag (`Healthy`, `Monitor`, `Attention Recommended`, `High Concern`, `Uncertain`).
  - Render **Smart Follow-up Questions Form**: Iterate over `data.questions`. Display display_order, question_text, and multi-choice option buttons.

---

### Step 4: Submit Farmer Answers
- **Endpoint**: `POST /api/scans/:id/answers`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "answers": [
      {
        "question_id": "q-uuid-1",
        "selected_options": ["Older leaves near the bottom"]
      },
      {
        "question_id": "q-uuid-2",
        "selected_options": ["Spreading fast (within 2-3 days)"]
      }
    ]
  }
  ```

---

### Step 5: Final Assessment & Action Plan Generation
- **Endpoint**: `POST /api/scans/:id/finalize`
- **Method**: `POST`
- **UI Display**:
  - **Final Assessment Banner**: Condition, Confidence, Concern Level, and "Why" / Evidence breakdown.
  - **Visual Evidence List**: Bullet points from `data.evidence.visual`.
  - **Farmer-Reported Evidence List**: Bullet points from `data.evidence.farmer_reported`.
  - **Tiered Action Plan**:
    - 🚨 *Immediate Actions*
    - 👁️ *Monitoring Steps*
    - 🛡️ *Prevention Steps*
    - 👨‍🌾 *Expert Guidance (KVK)*
    - ⚠️ *Disclaimer Banner*

---

### Step 6: Scan History & Re-scan / Comparison
- **History List**: `GET /api/scans` (Returns list of user scans ordered by `created_at DESC`).
- **View Past Scan**: `GET /api/scans/:id`
- **Re-scan / Baseline Comparison**:
  1. Upload new image with `parent_scan_id = <BASELINE_SCAN_ID>`.
  2. Complete scan steps 3-5.
  3. Call `POST /api/scans/<BASELINE_SCAN_ID>/compare` with payload `{ "followup_scan_id": "<NEW_SCAN_ID>" }`.
  4. UI renders trajectory badge: `Improving` 🟢, `Stable` 🟡, `Worsening` 🔴, or `Unclear` ⚪.

---

## 3. Error Handling Contract

All error responses return standard HTTP error codes:

```json
{
  "success": false,
  "error": {
    "code": "IMAGE_INVALID",
    "message": "Image failed leaf quality checks: Low leaf foliage/greenery content detected. Please take a clearer photo of plant leaves.",
    "details": null
  }
}
```

### Key Error UI Prompts:
- **`IMAGE_INVALID` (400)**: Display camera retake guide modal explaining focus, lighting, and leaf positioning.
- **`UNAUTHORIZED` (401)**: Clear stored token and redirect user to `/login`.
- **`NOT_FOUND` (404)**: Show "Scan not found or access denied" empty state.
- **`AI_SERVICE_ERROR` (500)**: Display "AI engine busy. Please retry crop analysis."
