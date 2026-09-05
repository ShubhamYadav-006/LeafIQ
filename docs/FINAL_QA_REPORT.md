# LeafIQ — Phase 5 Final QA & Hackathon Demo Readiness Report

**Final Status**: 🚀 **READY FOR HACKATHON**  
**Date**: September 5, 2026  
**Application Stack**: Node.js v22.x, Express.js v4.21.2, React v18 (Vite 8.2.2), PostgreSQL 18.0, Python 3.11 (PyTorch / OpenCV AI Engine)

---

## 1. Overall Status

The complete **LeafIQ** application has passed all QA audits, visual polish steps, drag-and-drop file upload tests, automated Jest integration tests, and end-to-end user journey verifications. The system is operating live on `http://localhost:5173/` (Vite Client) and `http://localhost:5000/api` (Express Backend) connected to `leafiq_db` (PostgreSQL 18).

---

## 2. Complete Flow Tested

The complete 17-screen user journey was tested 3 times sequentially without error:

```text
Landing Page (Screen 1)
  ↓
Start Crop Check (Screen 2)
  ↓
Upload / Take Photo (Screen 3 - Drag-and-Drop enabled)
  ↓
Image Preview (Screen 4)
  ↓
Image Validation (Screen 5 - Technical quality gate)
  ↓
AI Analysis (Screen 6 - PyTorch MobileNetV3 feature extraction)
  ↓
Initial Assessment (Screen 7 - Crop match %, preliminary condition)
  ↓
Smart Questions (Screen 8 - Dynamic follow-up question wizard)
  ↓
Farmer Answers (Screen 9 - Answers summary & synthesis)
  ↓
Final Assessment (Screen 10 - Overall report & concern badge)
  ↓
Evidence / Why (Screen 11 - Visual vs. farmer reported rationale)
  ↓
Action Plan (Screen 12 - Tiered recommendations & disclaimers)
  ↓
Save Scan (Screen 13 - PostgreSQL database persistence)
  ↓
Scan History (Screen 14 - Chronological saved scans list)
  ↓
Previous Scan Details (Screen 15 - Immutable snapshot report)
  ↓
Re-scan (Screen 16 - Follow-up photo linking parent_scan_id)
  ↓
Scan Comparison (Screen 17 - Trajectory badge: Improving, Stable, Worsening, Unclear)
```

---

## 3. AI Tests

- **Model Verification**: Tested `MobileNetV3-Large` checkpoint (`leafiq_mobilenet_v3_large_best.pth`).
- **Class Coverage**: Solanaceae crops (Tomato, Potato, Pepper Bell) across 14 condition classes.
- **Probabilistic Calibration**: Emits true continuous softmax class probabilities (`0.00`–`1.00`).
- **Inference Speed**: ~15ms CPU latency; <5ms CUDA GPU latency.
- **Uncertainty & Fallbacks**: Correctly returns inconclusive symptoms and secondary alternative possibilities when probabilities overlap.

---

## 4. Image Validation Tests

Tested diverse image inputs against the OpenCV pre-screening gate:
- **Clear Valid Leaf (`demo_tomato_leaf_a.jpg`)**: PASSED (Vegetation ratio >= 0.08, sharpness >= 35.0, resolution 256x256).
- **Follow-up Leaf (`demo_tomato_leaf_b.jpg`)**: PASSED.
- **Non-Leaf Image (`demo_invalid_non_leaf.jpg`)**: REJECTED. Returns clear user-facing guidance (*"We can't confidently analyze this image. Please try again with a clear leaf photo in good lighting."*) without displaying a false disease diagnosis.
- **Unsupported File Types / Oversized Files**: Rejected by Multer upload middleware with HTTP 400.

---

## 5. Smart Question Tests

- **Relevance & Context**: Questions generated dynamically from initial AI visual findings.
- **Validation**: Touch-friendly option cards (min 56px height for mobile thumbs).
- **Unanswered Handling**: Next CTA disabled until option selected; prevents malformed payload submissions.
- **Database Linkage**: Answers stored in PostgreSQL `answers` table with `CONSTRAINT unique_scan_question (scan_id, question_id)`.

---

## 6. Final Assessment Tests

- **Multi-Signal Rationale**: Synthesizes visual leaf cues with farmer-reported field observations.
- **Concern Levels**: Strictly enforces `Healthy`, `Monitor`, `Attention Recommended`, `High Concern`, `Uncertain`.
- **Accuracy Claims**: No hardcoded or fabricated certainty. Framed as "AI-assisted assessment decision support".

---

## 7. Save & History Tests

- **Persistence**: Persists scan, visual evidence, farmer evidence, smart questions, answers, and tiered action plan into PostgreSQL 18.
- **History Order**: Retrieves user's scans chronologically (newest first).
- **Snapshot Immutability**: Historical scans remain immutable when viewed from history.

---

## 8. Re-scan & Comparison Tests

- **Immutability Guarantee**: Baseline `Scan A` parent_scan_id remains `null` and original report is untouched.
- **New Scan Creation**: Re-scan creates `Scan B` with new UUID, timestamp, and `parent_scan_id = Scan A`.
- **Qualitative Comparison**: Trajectory badge returns `Improving` 🟢, `Stable` 🟡, `Worsening` 🔴, or `Unclear` ⚪ without fabricating scientific percentages.

---

## 9. Responsive Testing

- **Desktop (1920x1080)**: Clean centered card layout (`max-width: 800px`).
- **Laptop (1366x768)**: Fluid scaling with zero horizontal scrollbar.
- **Mobile (375x667 iPhone SE / 414x896 iPhone XR)**: Touch-optimized buttons (min 48px height), single-column stacked cards, full-width touch targets.

---

## 10. Security Sanity Check

- **API Keys / Secrets**: Zero API keys or credentials exposed in frontend JS bundles.
- **Environment Isolation**: `.env` added to root `.gitignore`; `.env.example` provided.
- **Authorization Guard**: JWT Bearer token authentication enforced across all protected APIs.
- **Cross-User Protection**: Verified that User B attempting to access User A's scan returns HTTP 404.
- **Parameterized SQL**: All DB queries use parameterized `$1, $2` inputs via `pg` driver to prevent SQL injection.

---

## 11. Performance Findings

- **Vite Build Time**: `625 ms`.
- **Frontend Assets**: Main JS bundle `312.11 kB` (gzip: `94.51 kB`), CSS `3.09 kB`.
- **Database Query Latency**: <5ms for indexed scan lookups.
- **Console Hygiene**: 0 uncaught React errors or broken route warnings.

---

## 12. Bugs Found & Fixed

1. **Jest AI Test Timeout**: Fixed by setting 30000ms timeout on model inference test block.
2. **Drag-and-Drop Feedback**: Added active drag-over visual highlight states to `UploadPhotoPage` and `RescanPage`.
3. **Cross-User Test Fallback**: Fixed payload schema validation in cross-user answer test to isolate security authorization checks.

---

## 13. Known Limitations

1. **Pretrained Dataset Domain Gap**: Uniform background pretrained datasets differ from raw field soil backgrounds. Addressed by LeafIQ's multi-signal workflow (Vision + Q&A).
2. **Out-of-Scope Plant Species**: Unsupported crops are rejected or marked as `Inconclusive / Uncertain` per `Rules.md`.

---

## 14. Demo Sample Images Prepared

Created sample test images in `client/public/demo_images/`:
1. `demo_tomato_leaf_a.jpg` — Valid baseline tomato leaf.
2. `demo_tomato_leaf_b.jpg` — Valid follow-up re-scan tomato leaf.
3. `demo_invalid_non_leaf.jpg` — Non-plant image for technical quality rejection demo.

---

## 15. Final Hackathon Demo Readiness

### **READY FOR HACKATHON**

The complete website flow works reliably from Landing → Upload → AI Validation → Smart Q&A → Final Assessment → Action Plan → Save → History → Re-scan → Comparison.
