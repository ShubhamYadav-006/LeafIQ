# LeafIQ - Hackathon Pitch & Judge Presentation Guide 🌾📱

---

## 1. 1-Line Elevator Pitch
> **"LeafIQ is an AI-powered Crop Health Assessment & Advisory Platform that empowers farmers to diagnose crop diseases instantly from leaf photos, access localized organic treatment plans, and track crop recovery trajectories over time."**

---

## 2. Problem Statement 🚨
- **Delayed Diagnosis**: 60%+ of farmers in regional areas fail to diagnose crop pathogens early, leading to severe yield loss.
- **Access to Expert Agronomists**: Traditional laboratory diagnoses take 3–5 days and can be cost-prohibitive for smallholder farmers.
- **Generic Search Confusion**: Online search tools provide overwhelming, non-actionable chemical advice that can harm soil health.

---

## 3. The Solution & Live Flow 💡

1. **Snap & Scan**: The farmer uploads or takes a photo of an affected crop leaf.
2. **Local AI Vision Pipeline**: 
   - Validates image quality and leaf presence.
   - Accurately classifies crop species (*Mango, Tomato, Potato, Corn, Grape, Pepper, etc.*) and identifies pathogens (*Anthracnose, Early Blight, Powdery Mildew, Rust, etc.*).
3. **Clinical Agronomist Advisory Report**:
   - **Visual Evidence**: Dark necrotic lesions, yellowing halos, and spot patterns are highlighted.
   - **Immediate Actions (24-48h)**: Organic controls, pruning guidelines, bio-fungicides.
   - **Cultural Prevention & Monitoring**: Soil nutrition, sunlight penetration, and watering advice.
4. **Recovery Trajectory Tracking**: Farmers can re-scan their crops 5–7 days later to track if the infection trajectory is **Improving**, **Stable**, or in **Decline**.

---

## 4. Technical Architecture & Tech Stack 🏗️

| Component | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Responsive, mobile-first UI with Glassmorphism aesthetics |
| **Backend** | Node.js + Express.js | RESTful Serverless API ready for Vercel deployment |
| **AI / Vision Model** | PyTorch / Python | **100% Local AI Inference** (MobileNetV3 / Vision Pipeline) |
| **Database** | PostgreSQL (Neon Cloud) | Managed SQL DB accessed via Prisma ORM & `pg` pool |
| **Localization** | Custom i18n Engine | Native support for **English**, **हिन्दी (Hindi)**, and **मराठी (Marathi)** |

---

## 5. Key Differentiators & USPs 🌟

1. ⚡ **100% Local AI Engine**: Operates fully offline/self-hosted with zero reliance on third-party APIs (no Gemini/OpenAI dependency).
2. 🌐 **Regional Multilingual Support**: Accessible to Indian farmers in their native languages (Hindi, Marathi, English).
3. 🔓 **Instant Guest Check + Account Claiming**: Guest users can scan immediately without sign-up friction and save scan history with one click later.
4. 📈 **Time-Series Recovery Tracking**: Tracks crop health trajectory across multiple scans rather than single-shot predictions.

---

## 6. Sample Q&A for Judges ❓

### Q1: Is this dependent on Google Gemini or OpenAI?
> **Answer**: No. LeafIQ runs on a 100% local computer vision & PyTorch inference pipeline built into our backend. It has zero external third-party API dependencies.

### Q2: How does it handle poor internet in rural areas?
> **Answer**: The system is designed to be lightweight with minimal bandwidth usage, and the backend runs on serverless architecture with offline-first client architecture.

### Q3: What makes this different from generic plant identification apps?
> **Answer**: LeafIQ doesn't just identify a plant — it acts as a digital agronomist. It provides visual evidence analysis, immediate 24-hour action steps, long-term cultural prevention, and multi-scan recovery tracking.
