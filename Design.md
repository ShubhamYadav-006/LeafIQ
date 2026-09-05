# LeafIQ — Design & UI/UX Specification

## 1. Design Philosophy & Guidelines

LeafIQ is built to feel **trustworthy, clear, agricultural, and human-centered**. It serves farmers and crop growers who need immediate, understandable crop health insights on mobile devices and desktops.

### Core UX Rules
- **Show What Matters, When It Matters**: Minimize cognitive load at every stage.
- **Mobile-First Design**: Large touch targets (minimum 48px height), readable typography, single-column layouts on mobile.
- **Explainable, Uncertainty-Aware AI**: Never frame findings as guaranteed medical-style diagnoses. Clearly distinguish image observations from farmer-reported facts.
- **Strict Validation Guardrails**: Never process or display disease classifications if the image fails leaf validation.
- **Practical Actionability**: Every finding must connect directly: **Evidence → Assessment → Concern Level → Action Plan**.
- **No SaaS Clutter**: No decorative animations, neon effects, or distracting dashboards. Every element has a functional purpose.

---

## 2. Visual Design System

### 2.1 Color Palette
- **Primary Brand Green**: `#2D6A4F` (Forest Green - primary buttons, active states, key accents)
- **Primary Hover/Dark**: `#1B4332` (Deep Leaf Green)
- **Background Base**: `#F8F9FA` (Soft warm neutral)
- **Surface / Card Background**: `#FFFFFF` (Clean white with subtle 1px border `#E9ECEF`)
- **Text Primary**: `#1F2937` (High-contrast slate)
- **Text Secondary / Muted**: `#4B5563` (Accessible grey for descriptions and metadata)

### 2.2 Status & Concern Colors
- **Healthy**: `#2B8A3E` (Natural Green badge / background `#EBFBEE`)
- **Monitor**: `#E67700` (Amber badge / background `#FFF9DB`)
- **Attention Recommended**: `#D9480F` (Warm Orange badge / background `#FFF4E6`)
- **High Concern**: `#C92A2A` (Red badge / background `#FFE3E3`)
- **Uncertain / Inconclusive**: `#495057` (Neutral grey badge / background `#F1F3F5`)

### 2.3 Typography & Sizing
- **Font Family**: Modern, accessible sans-serif (`Inter`, `Plus Jakarta Sans`, or system sans-serif fallback).
- **Hierarchy**:
  - `H1` (Page Title): `28px` (Mobile) / `36px` (Desktop), SemiBold
  - `H2` (Section Header): `20px` (Mobile) / `24px` (Desktop), SemiBold
  - `H3` (Card Title): `16px` (Mobile) / `18px` (Desktop), Medium
  - `Body`: `15px` / `16px`, Regular (Line height: `1.5`)
  - `Caption / Meta`: `13px` / `14px`, Regular
- **Border Radius**: Buttons (`10px`), Cards (`14px`), Inputs/Badges (`8px`).

---

## 3. Screen-by-Screen UI/UX Specifications

---

### Screen 1: LeafIQ Landing / Home

1. **Screen Name**: `Landing / Home`
2. **Purpose**: Welcomes the user, clearly explains what LeafIQ does in plain language, and directs them immediately into a crop check.
3. **What the User Sees**: Clean header with LeafIQ logo, high-impact hero message, 4-step process overview (Upload → Analyze → Answer → Act), prominent CTA button, and secondary link to recent scan history.
4. **Main Content/Components**:
   - Header with Logo and navigation links (*Home*, *Scan History*, *User*).
   - Hero Card: Headline *"Understand your crop. Act before problems spread."* and short value proposition.
   - 4-Step Process Visual: 1. Photo → 2. Validation & Vision → 3. 2-3 Quick Questions → 4. Clear Action Plan.
   - Quick History Banner: Summary of last scan (if logged in).
5. **Primary CTA**: `[ Start Crop Check ]` (Large green primary button).
6. **Secondary Action**: `[ View Past Scans ]` (Subtle outline button or text link).
7. **Loading State**: Quick skeleton shimmer for user session and past scan card.
8. **Error/Invalid State**: Offline banner if network is disconnected.
9. **What Happens After Primary CTA**: Navigates directly to *Screen 2 / Screen 3: Start Crop Check & Upload*.
10. **Mobile Behavior**: Single column, centered CTA taking full width, sticky bottom CTA on mobile scroll.

---

### Screen 2: Start Crop Check

1. **Screen Name**: `Start Crop Check (Selection & Instructions)`
2. **Purpose**: Prepares the user with straightforward photography tips so the first photo succeeds.
3. **What the User Sees**: Clear headline *"Check Your Crop"*, 3 visual photography tips, and upload launcher.
4. **Main Content/Components**:
   - Back arrow button.
   - Photography Tips Checklist:
     - ☀️ *Use clear natural lighting*
     - 🍃 *Focus closely on the affected leaf*
     - 📐 *Keep the leaf flat and centered*
   - Optional Crop Selector (Dropdown: e.g., Tomato, Potato, Pepper, Maize, Rice, or "Auto-detect by AI").
5. **Primary CTA**: `[ Take Photo or Upload ]` (Prominent button).
6. **Secondary Action**: `[ Back to Home ]`.
7. **Loading State**: N/A (Static guidance state).
8. **Error/Invalid State**: Helpful alert if camera permission is denied on the device with step-by-step unblock instructions.
9. **What Happens After Primary CTA**: Triggers native file selector or camera capture directly.
10. **Mobile Behavior**: Direct trigger of native mobile camera / gallery picker with full-width action bar.

---

### Screen 3: Upload / Take Photo

1. **Screen Name**: `Upload / Take Photo Dropzone`
2. **Purpose**: Enables rapid drag-and-drop or camera snapping of the leaf image.
3. **What the User Sees**: Large tap-to-upload card with camera icon, file dropzone, and format guidelines.
4. **Main Content/Components**:
   - Large dashed upload container with camera/upload icon.
   - Label: *"Tap to snap a leaf photo or browse files"*.
   - Format notice: *"JPG, PNG, WEBP (up to 10MB)"*.
5. **Primary CTA**: `[ Select Image ]` / `[ Capture Photo ]`.
6. **Secondary Action**: `[ Cancel ]`.
7. **Loading State**: Circular progress indicator while the image file is reading from disk into memory.
8. **Error/Invalid State**: Toast message if file exceeds 10MB or is an unsupported format (*"Please choose a valid JPG or PNG image"*).
9. **What Happens After Primary CTA**: Image selected → advances immediately to *Screen 4: Image Preview*.
10. **Mobile Behavior**: Large 180px tap area, optimized for one-hand thumb tap to open the device camera.

---

### Screen 4: Image Preview

1. **Screen Name**: `Image Preview & Confirmation`
2. **Purpose**: Allows the user to inspect their photo before submitting it to the AI pipeline.
3. **What the User Sees**: Centered leaf photo preview with clear options to proceed or retake.
4. **Main Content/Components**:
   - High-resolution preview of the selected image.
   - Quick check prompt: *"Is the leaf clearly visible and in focus?"*.
   - Image details (file size and dimensions).
5. **Primary CTA**: `[ Analyze Leaf ]` (Solid primary green button).
6. **Secondary Action**: `[ Retake Photo ]` (Outline/ghost button).
7. **Loading State**: Image loading spinner until full resolution preview renders.
8. **Error/Invalid State**: If image fails to decode, display *"Image preview failed. Please choose another photo."* with a retry button.
9. **What Happens After Primary CTA**: Starts file upload and transitions to *Screen 5 & 6: Image Validation & Analysis*.
10. **Mobile Behavior**: Fixed bottom action bar with two equal buttons (`[ Retake ]` and `[ Analyze Leaf ]`).

---

### Screen 5: Image Validation

1. **Screen Name**: `Image Validation Gate`
2. **Purpose**: Guardrail stage that verifies whether the image actually contains a clear, usable crop leaf before performing expensive analysis.
3. **What the User Sees**: Animated checklist validating image quality and leaf presence.
4. **Main Content/Components**:
   - Thumbnail of uploaded leaf.
   - Validation Indicators:
     - 🔍 *Checking image clarity...*
     - 🌿 *Detecting crop leaf foliage...*
     - 📐 *Verifying symptom visibility...*
5. **Primary CTA**: Disabled during validation; becomes `[ Continue ]` automatically upon success.
6. **Secondary Action**: `[ Cancel ]`.
7. **Loading State**: Pulse animation on the current verification checkmark.
8. **Error/Invalid State (Meaningful Failure)**:
   - Alert Box: *"We couldn't clearly identify a crop leaf in this photo."*
   - Specific reason shown (e.g., *"Photo is too blurry"*, *"No plant tissue detected"*, *"Lighting is too dark"*).
   - Recovery Button: `[ Retake with Better Lighting ]`.
   - **Rule**: Never show a disease diagnosis if validation fails!
9. **What Happens After Primary CTA**: Validation passes → immediately transitions to *Screen 6: AI Analysis*.
10. **Mobile Behavior**: Compact step-loader taking minimal vertical space.

---

### Screen 6: AI Analysis / Processing

1. **Screen Name**: `AI Analysis / Processing State`
2. **Purpose**: Provides transparent visual feedback as the AI extracts visual symptoms and formulates targeted questions.
3. **What the User Sees**: Transparent, honest progress screen communicating genuine processing stages.
4. **Main Content/Components**:
   - Subtly blurred image thumbnail with scanning indicator.
   - Real progress steps:
     - ✓ *Leaf validated*
     - ✓ *Crop detected: Tomato*
     - ● *Extracting visual symptoms (lesions, discoloration)...*
     - ○ *Preparing initial assessment and questions...*
   - Reassurance text: *"This takes about 3–5 seconds..."*.
5. **Primary CTA**: Hidden during active processing.
6. **Secondary Action**: `[ Cancel Check ]`.
7. **Loading State**: Active spinner and step-by-step check transitions.
8. **Error/Invalid State**: If API times out: *"Analysis took longer than expected. Please try again."* with a `[ Retry Analysis ]` button.
9. **What Happens After Processing**: Automatically navigates to *Screen 7: Initial Assessment* or *Screen 8: Smart Questions*.
10. **Mobile Behavior**: Clean vertical timeline centered on screen.

---

### Screen 7: Initial Assessment

1. **Screen Name**: `Initial Visual Findings`
2. **Purpose**: Shows the user what the AI sees from the photo alone and why further farmer input is needed for high confidence.
3. **What the User Sees**: Detected crop, primary visual indicators, preliminary observation, and note requesting farmer context.
4. **Main Content/Components**:
   - Identified Crop Badge (e.g., *Tomato Leaf* • 92% visual match).
   - Preliminary Observation Card:
     - *Preliminary Observation: Signs resembling Early Blight*
     - *Initial Confidence: Moderate*
   - Visual Evidence Summary:
     - • *Dark concentric spots visible on leaf blade*
     - • *Chlorosis (yellowing) surrounding lesions*
   - Context Callout: *"Visual signs alone can be ambiguous. Answering 2 quick questions will give you a reliable action plan."*
5. **Primary CTA**: `[ Answer 2 Quick Questions ]` (Primary green button).
6. **Secondary Action**: `[ Skip to Final Report ]` (Muted text link for quick bypass).
7. **Loading State**: Skeleton loading for evidence cards.
8. **Error/Invalid State**: Inconclusive state banner if initial findings are ambiguous, urging the farmer to complete the questions.
9. **What Happens After Primary CTA**: Advances directly to *Screen 8 & 9: Smart Follow-up Questions*.
10. **Mobile Behavior**: Stacked cards with large `[ Answer Questions ]` CTA docked at the bottom.

---

### Screen 8: Smart Follow-up Questions

1. **Screen Name**: `Smart Follow-up Questions`
2. **Purpose**: Gathers vital field context (plant location, rate of spread, irrigation) that the camera cannot see.
3. **What the User Sees**: Step indicator (e.g., *Question 1 of 3*), clear simple question text, and large selectable options.
4. **Main Content/Components**:
   - Progress bar (e.g., Step 1 / 3).
   - Question Prompt: e.g., *"Where did you first notice these spots?"*.
   - Multiple Choice Option Cards (Large touch targets with radio indicator):
     - `○ Older leaves near the bottom`
     - `○ Newer leaves at the top`
     - `○ Spread evenly across the plant`
     - `○ Not sure`
   - Context Helper: *"This helps differentiate soil-borne blight from airborne spot diseases."*
5. **Primary CTA**: `[ Next Question ]` (Enabled once an option is selected).
6. **Secondary Action**: `[ Previous Question ]` / `[ Skip Question ]`.
7. **Loading State**: Subtle fade transition between question slides.
8. **Error/Invalid State**: Required field hint: *"Please select an option to continue"*.
9. **What Happens After Primary CTA**: Cycles through questions (1 → 2 → 3) and advances to *Screen 9: Review Answers / Synthesize*.
10. **Mobile Behavior**: Radio cards have min 56px height for effortless thumb tapping.

---

### Screen 9: Farmer Answers Review & Synthesis

1. **Screen Name**: `Observations Summary & Assessment Synthesis`
2. **Purpose**: Validates submitted answers and shows the AI synthesizing visual cues with farmer observations.
3. **What the User Sees**: Summary of provided answers with an active "Synthesizing full assessment" state.
4. **Main Content/Components**:
   - Compact checklist of answered context:
     - 📍 *First noticed on: Older leaves*
     - ⏱️ *Spread rate: Appeared over last 3-4 days*
     - 💧 *Recent weather/watering: Frequent overhead rain*
   - Synthesis Animation: *"Combining visual evidence with your field observations..."*.
5. **Primary CTA**: `[ Generate Final Assessment ]` (Auto-triggers or manual click).
6. **Secondary Action**: `[ Edit Answers ]` (Allows adjusting choices before finalization).
7. **Loading State**: Multi-signal reasoning spinner (1-2 seconds).
8. **Error/Invalid State**: Retry prompt if synthesis endpoint encounters network error.
9. **What Happens After Primary CTA**: Displays *Screen 10, 11, 12: Final Assessment, Evidence & Action Plan*.
10. **Mobile Behavior**: Smooth upward sheet transition to the final assessment report.

---

### Screen 10: Final Assessment

1. **Screen Name**: `Final Crop Health Assessment`
2. **Purpose**: The central report screen presenting the overall crop health finding, confidence, and urgency level.
3. **What the User Sees**: Clear assessment badge, condition name, confidence meter, concern level, and differential possibilities.
4. **Main Content/Components**:
   - Crop & Date Header (e.g., *Tomato • Scanned 5 Sep 2026*).
   - Primary Assessment Card:
     - Condition: **Early Blight (Alternaria solani)**
     - Confidence Badge: `Moderate to High Confidence`
     - Concern Level: `⚠️ Attention Recommended` (Orange badge)
   - Diagnostic Summary in plain language (2–3 sentences).
   - Differential / Alternative Possibility Card (if uncertainty exists):
     - *Another possibility: Septoria Leaf Spot (20% match)*
     - *Why: Overlapping spot patterns, but spread pattern favors Early Blight.*
5. **Primary CTA**: `[ View Action Plan ]` (Smooth scroll or direct step).
6. **Secondary Action**: `[ Save Scan to History ]` / `[ Share Report ]`.
7. **Loading State**: Full report skeleton loader.
8. **Error/Invalid State**: Generic error banner with option to reload cached scan.
9. **What Happens After Primary CTA**: Scrolls smoothly to *Screen 11 (Evidence)* and *Screen 12 (Action Plan)*.
10. **Mobile Behavior**: Sticky header with condition name and concern badge when scrolling down the report.

---

### Screen 11: Evidence / Why This Assessment

1. **Screen Name**: `Evidence & Reasoning Breakdown`
2. **Purpose**: Provides full transparency by separating what was seen in the photo from what was reported by the farmer.
3. **What the User Sees**: Two distinct side-by-side or stacked evidence cards explaining the rationale.
4. **Main Content/Components**:
   - Section Title: *"Why did LeafIQ reach this assessment?"*
   - **Card A: From the Leaf Image (Visual)**
     - 🔍 *Concentric "target board" rings detected inside lesions*
     - 🍂 *Yellow haloing around necrotic leaf margins*
   - **Card B: From Your Answers (Field Context)**
     - 🌿 *Symptoms concentrated on lower/older foliage first*
     - 🌧️ *Spreading accelerated following wet conditions*
   - Clear AI Disclaimer: *"LeafIQ provides AI-assisted decision support and is not a laboratory certification."*
5. **Primary CTA**: `[ View Recommended Actions ]`.
6. **Secondary Action**: `[ View Original Photo ]`.
7. **Loading State**: Fast render with smooth accordion toggle for evidence details.
8. **Error/Invalid State**: Fallback notice if specific evidence points are unavailable.
9. **What Happens After Primary CTA**: Advances focus to *Screen 12: Action Plan*.
10. **Mobile Behavior**: Stacked cards with clear green/blue visual accent borders.

---

### Screen 12: Action Plan

1. **Screen Name**: `Practical Action Plan & Recommendations`
2. **Purpose**: Gives the farmer immediate, practical, prioritized steps to manage their crop health without confusing jargon.
3. **What the User Sees**: Three structured action tiers (What to do now, What to monitor, When to seek expert help).
4. **Main Content/Components**:
   - **Tier 1: Immediate Steps (Do Today)**
     - 1. *Prune and safely dispose of heavily infected lower leaves.*
     - 2. *Avoid overhead watering; direct water to soil base to keep leaves dry.*
     - 3. *Sanitize pruning shears between plants.*
   - **Tier 2: What to Monitor (Next 3–5 Days)**
     - • *Check whether dark spots appear on higher canopy leaves.*
     - • *Observe nearby healthy plants for early spot development.*
   - **Tier 3: When to Seek Agricultural Expert Help**
     - • *If rapid spreading continues despite dry leaves, consult local extension services.*
5. **Primary CTA**: `[ Save Scan & Finish ]` (Primary green button).
6. **Secondary Action**: `[ Compare with Previous Scan ]` / `[ Start New Scan ]`.
7. **Loading State**: Action checklist shimmers during initial generation.
8. **Error/Invalid State**: Standard fallback action plan for general crop sanitation if AI generation fails.
9. **What Happens After Primary CTA**: Commits scan to database and opens *Screen 13: Save Scan Confirmation*.
10. **Mobile Behavior**: Checkable list items that farmers can tap to track completed chores.

---

### Screen 13: Save Scan Confirmation

1. **Screen Name**: `Save Scan Confirmation`
2. **Purpose**: Confirms that the assessment and field notes have been securely saved to the farmer's history.
3. **What the User Sees**: Success checkmark animation, scan summary card, and quick navigation choices.
4. **Main Content/Components**:
   - Green Success Icon ✓ *"Scan Saved to Your History"*.
   - Summary Card: *Tomato • Early Blight • 5 Sep 2026*.
   - Quick reminder: *"You can re-scan this plant in a few days to track progress."*
5. **Primary CTA**: `[ View in Scan History ]`.
6. **Secondary Action**: `[ Start Another Crop Check ]`.
7. **Loading State**: Saving spinner (under 500ms).
8. **Error/Invalid State**: Toast: *"Unable to save offline. Scan saved to local cache; will sync when reconnected."*
9. **What Happens After Primary CTA**: Redirects to *Screen 14: Scan History*.
10. **Mobile Behavior**: Clean dialog or full-page confirmation with centered actions.

---

### Screen 14: Scan History

1. **Screen Name**: `Scan History List`
2. **Purpose**: Allows farmers to browse all past crop assessments chronologically and filter by crop or status.
3. **What the User Sees**: List of historical scan cards showing thumbnail, crop name, condition, concern badge, and date.
4. **Main Content/Components**:
   - Header: *"Your Crop Scans"* with search/filter bar (e.g. *All Crops, Tomato, Potato*).
   - Scan History Card Items:
     - Leaf thumbnail photo.
     - Crop name (e.g., *Tomato*).
     - Assessed condition (e.g., *Early Blight*).
     - Concern level pill (`Attention`, `Monitor`, `Healthy`).
     - Relative date (*2 days ago • 5 Sep 2026*).
     - Re-scan action shortcut.
   - Empty State: *"No scans saved yet. Start your first crop check today!"* with `[ Start Crop Check ]` button.
5. **Primary CTA**: `[ Tap any scan to view details ]` / `[ New Crop Check ]` floating button.
6. **Secondary Action**: `[ Re-scan / Track ]` button on individual cards.
7. **Loading State**: Skeleton card list (3 placeholder cards).
8. **Error/Invalid State**: *"Failed to load history. Pull to refresh."*
9. **What Happens After Primary CTA**: Clicking a scan card navigates to *Screen 15: Previous Scan Details*.
10. **Mobile Behavior**: Infinite scroll list with pull-to-refresh and floating action button (FAB) for `+ New Scan`.

---

### Screen 15: Previous Scan Details

1. **Screen Name**: `Past Scan Report Details`
2. **Purpose**: View the complete historical immutable record of a past assessment.
3. **What the User Sees**: Exact snapshot of the past assessment including leaf image, findings, farmer answers, and action plan.
4. **Main Content/Components**:
   - Top Bar: Back button, scan timestamp, and share/delete options.
   - Original Leaf Image with zoom capability.
   - Assessment & Confidence breakdown (as recorded on that date).
   - Recorded evidence (both image cues and farmer answers from that session).
   - Original Action Plan.
   - Re-scan callout banner: *"Track this plant: Take a new photo to see if condition is improving."*
5. **Primary CTA**: `[ Re-scan This Plant / Compare ]` (Primary green button).
6. **Secondary Action**: `[ Back to History ]`.
7. **Loading State**: Content skeleton loader.
8. **Error/Invalid State**: 404 message: *"Scan record not found or was removed."*
9. **What Happens After Primary CTA**: Initiates re-scan workflow passing `parent_scan_id` to *Screen 16: Re-scan*.
10. **Mobile Behavior**: Full-height scrollable report identical to final assessment layout with a sticky `[ Re-scan ]` bottom bar.

---

### Screen 16: Re-scan

1. **Screen Name**: `Follow-up Re-scan / Photo Capture`
2. **Purpose**: Guides the farmer to take a follow-up photo of the same crop to evaluate disease progress.
3. **What the User Sees**: Split preview showing the *Baseline Photo* side-by-side with the *New Camera Viewfinder*.
4. **Main Content/Components**:
   - Reference card: *"Baseline Photo (5 Sep)"* showing previous leaf condition.
   - Active Camera Viewfinder: *"Take a new photo of the same leaf or plant branch"*.
   - Alignment tip: *"Try to match the angle and lighting of the previous scan."*
5. **Primary CTA**: `[ Capture & Compare ]` (Primary button).
6. **Secondary Action**: `[ Choose from Gallery ]` / `[ Cancel Re-scan ]`.
7. **Loading State**: Frame loading and camera initialization spinner.
8. **Error/Invalid State**: Validation warning if new photo fails leaf clarity check.
9. **What Happens After Primary CTA**: Submits new image, evaluates changes against baseline, and displays *Screen 17: Scan Comparison*.
10. **Mobile Behavior**: Split screen top (reference image 35% height) and bottom (camera viewfinder 65% height).

---

### Screen 17: Scan Comparison

1. **Screen Name**: `Temporal Progress & Comparison View`
2. **Purpose**: Compares baseline and follow-up scans to tell the farmer whether the crop condition is improving, stable, or worsening.
3. **What the User Sees**: Side-by-side visual comparison, trajectory badge, and qualitative progress explanation.
4. **Main Content/Components**:
   - Side-by-Side Photo Cards:
     - Left: *Baseline (5 Sep)* • Concern: *Attention*
     - Right: *Current (9 Sep)* • Concern: *Monitor*
   - Trajectory Status Badge:
     - `🟢 Improving` / `🟡 Stable` / `🔴 Worsening` / `⚪ Unclear`
   - Plain-Language Summary:
     - *"Lesions appear contained with no significant new spreading observed on upper foliage. Pruning and moisture control appear effective."*
   - Updated Action Plan Card: Next steps based on the observed trajectory.
5. **Primary CTA**: `[ Save Comparison to History ]`.
6. **Secondary Action**: `[ Done / Back to Home ]`.
7. **Loading State**: Side-by-side comparative loading shimmer.
8. **Error/Invalid State**: *"Insufficient visual difference to confirm trajectory. Continue regular monitoring."*
9. **What Happens After Primary CTA**: Saves linked comparison record to PostgreSQL and returns to history.
10. **Mobile Behavior**: Swipeable comparison slider or vertical stacked before/after cards with toggle view.

---

## 4. UI/UX Consistency Matrix

| Element | Specification |
|---|---|
| **Buttons** | Solid Green (`#2D6A4F`) for primary actions; Outline (`#E9ECEF` border) for secondary; Min height `48px`. |
| **Cards** | Clean white (`#FFFFFF`), `1px solid #E9ECEF` border, `14px` border radius, subtle padding `16px–24px`. |
| **Icons** | Simple stroke icons (`lucide-react` style: Camera, CheckCircle, AlertTriangle, RefreshCw, Calendar). |
| **Badges** | Pill badges with high contrast text on pastel tinted backgrounds for concern levels. |
| **Language** | Plain, supportive agricultural English; no dense academic or clinical jargon. |