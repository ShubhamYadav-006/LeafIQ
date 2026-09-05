# LeafIQ — System Architecture

## 1. Architecture Overview

LeafIQ is an AI-assisted crop health assessment web application built on the **PERN stack** (PostgreSQL, Express.js, React, Node.js). 

Unlike a simplistic "image-in, disease-out" tool, LeafIQ is architected around a multi-stage, evidence-based decision support pipeline that combines computer vision with farmer observations to deliver actionable, explainable crop health assessments and temporal monitoring.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND                                │
│  Landing → Photo Capture → Validation → Dynamic Q&A → Report → History  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST API (JSON & Multipart)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS.JS / NODE.JS API                          │
│   Routing • Image Ingestion • Workflow Orchestration • Error Handling   │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│       AI / ASSESSMENT SERVICE        │  │     POSTGRESQL DATABASE       │
│ • Image Validation & Crop Detection  │  │ • Scans & Leaf Images         │
│ • Symptom Extraction (Visual)        │  │ • Initial & Final Assessments │
│ • Targeted Follow-up Generation      │  │ • Evidence & Q&A Records      │
│ • Multi-Signal Reasoning & Action    │  │ • Action Plans                │
│ • Re-scan Comparison Engine          │  │ • Historical Progress Records │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 2. Core User Flow Architecture

The architecture directly reflects the 13 distinct stages of the LeafIQ user journey:

```text
[1. User Enters LeafIQ]
         ↓
[2. Start Crop Check]
         ↓
[3. Upload / Take Leaf Photo]
         ↓
[4. Image Validation] ──────────(Invalid Image) ──→ [Prompt Retake with Tips]
         ↓ (Valid Leaf)
[5. AI Analysis (Visual Feature Extraction)]
         ↓
[6. Initial Assessment]
         ↓
[7. Smart Follow-up Questions Generated]
         ↓
[8. Farmer Answers Questions]
         ↓
[9. Final Assessment (Visuals + Farmer Context)]
         ↓
[10. Evidence / Why (Transparent Breakdown)]
         ↓
[11. Action Plan (Immediate • Monitor • Escalate)]
         ↓
[12. Save Scan to Database]
         ↓
[13. Scan History & Re-scan / Compare]
```

---

## 3. Layered Responsibilities (PERN Stack)

### 3.1 React Frontend (Client Layer)
- **User Interface & Journey Flow**: Guided step-by-step wizard managing transition between upload, analysis, questioning, report, and history.
- **Image Handling**: Client-side image capture (camera/file selection), format/size checks, preview rendering, and compression prior to upload.
- **Dynamic Interaction State**: Renders follow-up questions sequentially (touch-friendly radio/checkbox options) and collects farmer inputs.
- **Assessment Visualization**: Structured display of condition, confidence badge, concern level, evidence breakdown, and practical action cards.
- **History & Comparison UI**: Displays chronological scan history list and side-by-side re-scan comparative diffs (improving / stable / worsening).

### 3.2 Express.js API (Backend Orchestration Layer)
- **REST Endpoints**: Exposes clean API contracts matching each phase of the assessment lifecycle.
- **Multipart Ingestion**: Receives image payloads via `multer` for secure temporary buffering and storage path allocation.
- **Workflow Orchestrator**: Coordinates requests between the frontend, AI reasoning layer, and database.
- **Validation Guardrails**: Enforces input validation, file integrity, and fallback mechanisms if AI responses are uncertain.
- **Data Serialization**: Maps AI JSON payloads into relational schema entities for storage and retrieval.

### 3.3 AI / Assessment Services Layer
- **Image Validation Service**: Verifies leaf visibility, image clarity, and recognizable crop foliage.
- **Vision Extraction Service**: Identifies visible symptoms (lesions, chlorosis, discoloration, structural deformities, pest damage).
- **Question Generation Engine**: Produces 2–4 targeted, context-aware multiple-choice questions based on the visual findings and ambiguity factors.
- **Multi-Signal Reasoning Engine**: Synthesizes visual evidence + farmer observations to compute the final assessment, confidence level, and "why" explanations.
- **Action Plan Generator**: Formulates tiered recommendations: Immediate Steps, Monitoring Indicators, and Expert Escalation Triggers.
- **Comparison Engine**: Evaluates current scan against a past scan of the same crop to determine trajectory (improving / stable / worsening).

### 3.4 PostgreSQL Database Layer
- **Scans Table**: Stores core scan metadata (scan ID, crop type, image URL/path, timestamps, status).
- **Assessments Table**: Stores initial/final assessment results, confidence scores, concern levels, and disclaimers.
- **Evidence Table**: Records structured visual cues extracted from the leaf and farmer-reported observations.
- **Questions & Answers Table**: Persists the generated follow-up questions and the corresponding farmer responses.
- **Action Plans Table**: Stores structured action points (immediate actions, monitoring checklist, escalation guidance).
- **Scan Comparisons Table**: Tracks links between baseline scans and follow-up re-scans with comparative analysis summaries.

---

## 4. End-to-End Data Flow & Lifecycle

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ React Frontend  │       │ Express Backend │       │   AI Services   │       │   PostgreSQL    │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │                         │
  [1-3]  │ POST /api/scan/initial  │                         │                         │
  Upload ├────────────────────────>│ 1. Validate File       │                         │
  Photo  │ (Multipart Leaf Image)  │ 2. Send Image to AI     │                         │
         │                         ├────────────────────────>│                         │
         │                         │                         │ Visual Feature Analysis │
         │                         │                         │ & Question Generation   │
  [4-7]  │                         │<────────────────────────┤                         │
  Initial│<────────────────────────┤ Return Initial Findings │                         │
  Result │ (Crop, Symptoms, Qs)    │ & Follow-up Questions   │                         │
         │                         │                         │                         │
  [8]    │                         │                         │                         │
  Farmer │                         │                         │                         │
  Answers│ POST /api/scan/finalize │                         │                         │
  Qs     ├────────────────────────>│ 1. Merge Image Evidence│                         │
         │ (Answers + Session ID)  │    with Farmer Answers  │                         │
         │                         ├────────────────────────>│ Multi-Modal Reasoning:  │
         │                         │                         │ Final Assessment, Why,  │
  [9-11] │                         │<────────────────────────┤ Action Plan             │
  Final  │<────────────────────────┤ Return Full Assessment  │                         │
  Report │ (Assessment, Action)    │ & Action Recommendations│                         │
         │                         │                         │                         │
  [12]   │ POST /api/scan/save     │                         │                         │
  Save   ├────────────────────────>│ Insert Records          ├────────────────────────>│
  Scan   │<────────────────────────┤ Confirm Saved           │<────────────────────────┤
         │                         │                         │                         │
  [13]   │ GET /api/scans          │                         │                         │
  History├────────────────────────>│ Query Scan History      ├────────────────────────>│
  & Comp │<────────────────────────┤ Return Past Records     │<────────────────────────┤
         │                         │                         │                         │
```

---

## 5. API Endpoint Specifications

| Stage | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Initial Upload & Validation** | `POST` | `/api/scans/analyze-initial` | Accepts leaf image, validates presence of crop leaf, returns initial symptoms and targeted questions. |
| **Final Assessment Generation** | `POST` | `/api/scans/assess-final` | Accepts farmer answers alongside initial visual findings, returns final assessment, evidence breakdown, and action plan. |
| **Save Scan** | `POST` | `/api/scans/save` | Persists completed scan, assessment, evidence, answers, and action plan to PostgreSQL. |
| **List Scan History** | `GET` | `/api/scans` | Retrieves historical scan summaries for the user. |
| **Get Scan Details** | `GET` | `/api/scans/:id` | Retrieves full scan report including image, evidence, answers, and recommendations. |
| **Re-scan & Compare** | `POST` | `/api/scans/:id/compare` | Compares new leaf scan against past scan `:id` and returns comparative status (improving/stable/worsening). |

---

## 6. Key Architectural Principles for Hackathon Delivery

1. **Practical & Focused**: Built strictly with standard PERN components without over-engineered microservices or extraneous external integrations.
2. **Explainable AI Integration**: Prompts enforce structured JSON outputs dividing findings into *Visual Evidence*, *Farmer Inputs*, and *Synthesized Assessment*.
3. **Graceful Fallbacks**: Image rejection at validation stage protects against garbage-in/garbage-out and keeps AI processing reliable.
4. **State Isolation**: Assessment generation can operate statefully in memory during the multi-step user interaction and is committed cleanly to PostgreSQL upon completion.