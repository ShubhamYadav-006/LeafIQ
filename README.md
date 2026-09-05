# LeafIQ - AI-Powered Crop Health & Disease Diagnosis System

LeafIQ is an intelligent agricultural decision-support system designed to empower farmers and field advisors with instant, AI-driven crop leaf disease identification, confidence-tiering, and actionable management plans.

## Repository Structure

```
LeafIQ/
│
├── frontend/             # React (Vite) Single Page Application
│   ├── public/           # Static assets and icons
│   └── src/
│       ├── assets/       # Visual assets (illustrations, icons)
│       ├── components/   # Domain-organized UI components
│       │   ├── common/   # Reusable UI (Navbar, Modals, Badges, Progress)
│       │   ├── upload/   # Photo upload & validation components
│       │   ├── assessment/# Diagnostic & analysis cards
│       │   ├── questions/ # Interactive smart question components
│       │   ├── evidence/ # Visual evidence breakdowns
│       │   ├── action-plan/# Action plan cards & guidance
│       │   ├── history/  # Past scan logs & detail views
│       │   └── comparison/# Scan comparison & trajectory views
│       ├── pages/        # Page view routers (Landing, Upload, Assessment, etc.)
│       ├── services/     # API client (Axios/fetch wrapper)
│       ├── hooks/        # Custom React hooks
│       ├── context/      # React state context (Auth, ScanFlow)
│       ├── utils/        # Utility helpers
│       └── constants/    # Global constants & step definitions
│
├── backend/              # Node.js Express REST API Server
│   ├── src/
│   │   ├── config/       # Environment & database connection pool
│   │   ├── controllers/  # API request controllers (.controller.js)
│   │   ├── routes/       # Express route handlers (.routes.js)
│   │   ├── services/     # Business logic & AI bridge (.service.js)
│   │   ├── middleware/   # Auth, file upload, & error middleware
│   │   ├── validators/   # Input validation schemas
│   │   ├── utils/        # API response & error formatters
│   │   ├── app.js        # Express app configuration
│   │   └── server.js     # HTTP server entry point
│   ├── uploads/          # Statically served uploaded leaf images
│   ├── tests/            # API integration & unit tests
│   └── package.json
│
├── ai/                   # AI / Computer Vision Engine (PyTorch)
│   ├── dataset/          # Dataset samples & manifests
│   ├── models/           # Pretrained MobileNetV3 model checkpoints
│   ├── notebooks/        # Jupyter experimentation notebooks
│   ├── src/
│   │   ├── preprocessing/ # Image loading & transform pipelines
│   │   ├── training/     # Model training scripts
│   │   ├── inference/    # Model architecture & inference engine
│   │   └── validation/   # Image quality & foliage validation gate
│   ├── tests/            # AI pipeline unit tests
│   └── requirements.txt
│
├── database/             # Database Schemas & Migrations
│   ├── migrations/       # PostgreSQL migration scripts
│   ├── seeds/            # Initial database seed data
│   └── schema.sql        # Core database DDL schema
│
├── docs/                 # System Specification & Architecture Documents
│   ├── PRD.md            # Product Requirements Document
│   ├── DESIGN.md         # UI/UX & System Design Spec
│   ├── RULES.md          # Agronomic & Diagnostic Rules
│   ├── ARCHITECTURE.md   # Architectural & Component Overview
│   ├── DATABASE.md       # Entity-Relationship & Schema Spec
│   └── AI_REPORT.md      # AI Model Evaluation & Benchmark Report
│
├── .gitignore
├── .env.example
├── README.md
└── package.json
```

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: 3.9+ (with PyTorch)
- **PostgreSQL**: 14+

### 2. Environment Setup
Copy `.env.example` to `backend/.env` and update your database credentials:
```bash
cp .env.example backend/.env
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Engine
cd ../ai && pip install -r requirements.txt
```

### 4. Running the Development Servers
- **Frontend**: `cd frontend && npm run dev`
- **Backend**: `cd backend && npm run dev`
- **AI Inference CLI**: `python ai/src/inference/predict.py --image path/to/leaf.jpg`
