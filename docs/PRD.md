# LeafIQ — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Hackathon MVP  
**Product Name:** LeafIQ  
**Category:** Evidence-Based Crop Health Assessment  
**Technology Stack:** PERN (PostgreSQL, Express.js, React, Node.js)  

---

## 1. Product Overview

**LeafIQ** is an AI-assisted crop health assessment web application designed to help farmers and crop growers identify visible crop issues early, understand the underlying factors, and take immediate, practical action before problems spread.

Unlike black-box disease classifiers that output a single label from a photo, LeafIQ implements an **evidence-based decision support workflow**. It pairs computer vision with targeted farmer field observations to deliver an explainable assessment, transparent confidence levels, and tiered, actionable next steps.

---

## 2. Problem Statement

1. **Premature & Inaccurate Diagnoses**: Visual symptoms across different crop diseases (e.g., fungal leaf spots vs. bacterial blights vs. nutrient deficiencies) often look identical at early stages. Single-photo AI classifiers frequently misdiagnose issues without contextual knowledge.
2. **Lack of Explainability & Trust**: Farmers are given a disease name without understanding *why* the AI reached that conclusion or what visual cues were detected.
3. **No Practical Action Plan**: Traditional tools provide static encyclopedic text rather than clear, prioritized steps on what to do today, what to monitor over coming days, and when to seek professional help.
4. **No Monitoring & Continuity**: Farmers lack a lightweight way to track whether a crop condition is improving or worsening after applying interventions.

---

## 3. Target User & Persona

- **Primary Users**: Smallholder farmers, greenhouse growers, agricultural field workers, and home gardeners.
- **User Needs**:
  - Fast, reliable leaf assessment on mobile devices directly in the field.
  - Plain, non-technical agricultural language without clinical jargon.
  - Transparent reasoning that accounts for their own field observations.
  - Practical, safe immediate actions to contain crop damage.

---

## 4. Product Goals & Tagline

### Tagline
> **"Don't just detect. Understand. Act. Monitor."**

### Core Goals
- **Empower Farmers**: Turn a single leaf photo into a comprehensive, understandable health assessment.
- **Bridge Vision & Context**: Combine leaf imagery with 2–4 targeted farmer answers to drastically reduce ambiguity.
- **Deliver Immediate Value**: Provide clear, prioritized action plans within 10 seconds of interaction.
- **Enable Temporal Tracking**: Allow farmers to re-scan and compare leaf progress over time (improving, stable, worsening).

---

## 5. Core User Journey

The complete LeafIQ experience follows a guided 13-stage workflow:

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

## 6. Functional Requirements by Flow Step

### 6.1 Screen 1 & 2: Landing & Start Crop Check
- **FR-1.1**: The landing screen must provide a clear 1-click entry point (`[ Start Crop Check ]`).
- **FR-1.2**: Display photography tips (good lighting, close focus on leaf, centered framing) before triggering camera/upload.
- **FR-1.3**: Provide an optional crop selector or allow "Auto-detect Crop" by AI.

### 6.2 Screen 3 & 4: Upload, Capture & Preview
- **FR-2.1**: Support direct camera capture on mobile devices and file upload (`image/jpeg`, `image/png`, `image/webp` up to 10MB).
- **FR-2.2**: Render an interactive image preview allowing the user to inspect photo clarity before triggering analysis.
- **FR-2.3**: Provide a `[ Retake Photo ]` option on the preview screen.

### 6.3 Screen 5: Image Validation Gate
- **FR-3.1**: Inspect the uploaded photo to verify the presence of clear crop foliage/leaf tissue.
- **FR-3.2**: Reject invalid photos (blurry, too dark, non-plant objects, scenery).
- **FR-3.3**: **Strict Rule**: Never generate or display a disease assessment on an image that fails validation.
- **FR-3.4**: Present helpful, actionable feedback explaining why validation failed and how to capture a better photo.

### 6.4 Screen 6 & 7: AI Analysis & Initial Assessment
- **FR-4.1**: Detect the crop type (e.g., Tomato, Potato, Pepper, Maize).
- **FR-4.2**: Extract visible leaf symptoms (lesions, discoloration, chlorosis, concentric rings, structural wilt).
- **FR-4.3**: Emit an initial assessment consisting of: detected crop, preliminary condition, initial confidence score (0.00–1.00), concern level (`healthy`, `monitor`, `attention`, `high_concern`, `uncertain`), and visual evidence bullet points.
- **FR-4.4**: Explicitly inform the user that visual signs alone are preliminary and require field context for a reliable action plan.

### 6.5 Screen 8 & 9: Smart Follow-Up Questions & Farmer Answers
- **FR-5.1**: Generate 2–4 dynamic, multiple-choice questions tailored specifically to the detected symptoms and ambiguities.
- **FR-5.2**: Focus questions on context the camera cannot see (e.g., location on plant canopy, timeline/spread rate, recent rainfall/irrigation).
- **FR-5.3**: Present questions one at a time with large touch-friendly choices (min 48px height) and allow a skip option.
- **FR-5.4**: Synthesize farmer answers with image findings in the reasoning engine.

### 6.6 Screen 10 & 11: Final Assessment & Evidence Breakdown
- **FR-6.1**: Produce a synthesized final assessment including: final condition, confidence rating, concern badge, and a plain-language summary.
- **FR-6.2**: Present differential/alternative conditions when visual or field overlap exists (e.g., *Alternative: Septoria Leaf Spot (20%)*).
- **FR-6.3**: Display a transparent **Evidence Breakdown** separating:
  - *From the Image*: Concentric lesions, chlorotic halo.
  - *From Your Answers*: Symptoms started on lower leaves, spread after rain.
- **FR-6.4**: Include a prominent AI decision-support disclaimer.

### 6.7 Screen 12 & 13: Action Plan & Save Confirmation
- **FR-7.1**: Deliver a prioritized, 3-tier action plan:
  - **Immediate Actions (Today)**: Physical pruning, moisture management, tool sanitation.
  - **What to Monitor (3–5 Days)**: Spread indicators, new lesion formation.
  - **When to Seek Expert Help**: Escalation criteria for consulting local extension agents.
- **FR-7.2**: Prohibit uncalibrated, unsafe chemical dosage recommendations.
- **FR-7.3**: Persist the completed scan, image metadata, evidence, answers, and action plan to PostgreSQL under the user's account.

### 6.8 Screen 14 & 15: Scan History & Previous Details
- **FR-8.1**: Provide a chronological scan history list for the authenticated user, sortable by recency and filterable by crop.
- **FR-8.2**: Ensure historical scan records are strictly immutable (never overwritten).
- **FR-8.3**: Allow full inspection of past scan snapshots (leaf image, original evidence, answers, and action plans).

### 6.9 Screen 16 & 17: Re-Scan & Comparison
- **FR-9.1**: Allow users to initiate a follow-up re-scan linked to a baseline scan (`parent_scan_id`).
- **FR-9.2**: Render a split-screen camera/viewfinder showing the baseline photo alongside the new camera frame.
- **FR-9.3**: Evaluate changes qualitatively into one of four standard trajectories: `improving`, `stable`, `worsening`, or `unclear`.
- **FR-9.4**: Provide a plain-language trajectory summary and updated guidance without fabricating uncalibrated percentage metrics.

---

## 7. AI Behavior, Guardrails & Limitations

1. **Probabilistic Decision Support**: AI findings are decision aids, not certified laboratory diagnoses.
2. **Bounded Knowledge Scope**: Classifications must be restricted to supported crop varieties and known common conditions.
3. **Structured JSON Output**: All AI interactions must enforce typed, valid JSON contracts matching backend schemas.
4. **Confidence Normalization**: All confidence values must be bounded between `0.00` and `1.00`.
5. **No Hallucinations on Contradictions**: When visual signs and farmer answers conflict, the AI must lower confidence, set concern level to `uncertain`, and recommend local expert consultation.

---

## 8. Non-Functional Requirements (NFRs)

- **Performance**: Initial image validation and analysis response time < 5 seconds; final assessment synthesis < 3 seconds.
- **Mobile-First UX**: Responsive layouts optimized for 360px–420px mobile viewport widths with 48px touch targets.
- **Data Privacy & Security**: User authentication with salted/hashed passwords (`bcrypt`), user-isolated scan queries, and no API keys or secrets in client builds.
- **Reliability & Offline Grace**: Meaningful error handling at every flow step with local session caching if database commits fail.
- **Accessibility**: High contrast text ratios, semantic HTML5, clear focus states, and multi-modal status indicators (combining icons, colors, and text).

---

## 9. Scope & MVP Boundaries

### In-Scope (Core LeafIQ MVP)
- Leaf photo capture, upload, and client preview.
- Meaningful leaf validation guardrail.
- Vision-based crop identification and symptom extraction.
- Preliminary initial assessment.
- Dynamic generation of 2–4 follow-up context questions.
- Multi-signal synthesis of visual evidence + farmer observations.
- Transparent Evidence ("Why") breakdown.
- 3-tier practical action plan and standard disclaimer.
- PostgreSQL scan persistence and historical scan list.
- Qualitative re-scan comparison (improving / stable / worsening / unclear).

### Out-of-Scope (Strictly Excluded)
- Live weather widgets and forecasts.
- E-commerce, pesticide marketplaces, or affiliate sales.
- IoT sensor integrations and automated irrigation hardware.
- Social community feeds, forums, or chat groups.
- Government agricultural scheme directories.
- In-app live agronomist video/telephony booking.
- Complex multi-field farm boundary GIS mapping.

---

## 10. Success Criteria for Hackathon MVP

1. **Flawless End-to-End Flow**: Smooth, uninterrupted execution of the complete 13-stage journey in under 60 seconds during live demonstrations.
2. **Effective Validation**: Clear rejection of non-leaf photos without false positive disease outputs.
3. **Explainable Output**: Demonstration of how farmer answers refine the initial assessment into a transparent final action plan.
4. **Temporal Re-scan Capability**: Successfully linking a follow-up scan to a baseline record and displaying an intuitive trajectory comparison.