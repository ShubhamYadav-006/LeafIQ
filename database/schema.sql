-- =============================================================================
-- LeafIQ Migration 001: Initial Schema
-- Source of Truth: Database.md
-- =============================================================================

-- Enable pgcrypto / uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Custom Enums
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'agronomist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scan_status AS ENUM (
        'uploaded',
        'analyzed_initial',
        'questions_pending',
        'completed',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE concern_level AS ENUM (
        'healthy',
        'monitor',
        'attention',
        'high_concern',
        'uncertain'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_source AS ENUM (
        'visual',
        'farmer_reported'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM (
        'single_choice',
        'multiple_choice',
        'boolean',
        'text'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE comparison_trajectory AS ENUM (
        'improving',
        'stable',
        'worsening',
        'unclear'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role user_role NOT NULL DEFAULT 'farmer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Scans Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,

    -- Image Metadata
    image_url TEXT NOT NULL,
    original_filename VARCHAR(255),
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),

    -- Crop Identification
    crop_name VARCHAR(100),
    crop_variety VARCHAR(100),
    crop_confidence NUMERIC(3, 2) CHECK (crop_confidence >= 0.00 AND crop_confidence <= 1.00),

    -- Initial Assessment (Stage 1)
    initial_condition VARCHAR(150),
    initial_confidence NUMERIC(3, 2) CHECK (initial_confidence >= 0.00 AND initial_confidence <= 1.00),
    initial_notes TEXT,

    -- Final Assessment (Stage 2)
    final_condition VARCHAR(150),
    final_confidence NUMERIC(3, 2) CHECK (final_confidence >= 0.00 AND final_confidence <= 1.00),
    concern_level concern_level,
    assessment_summary TEXT,

    -- Status & Lifecycle
    status scan_status NOT NULL DEFAULT 'uploaded',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. Evidence Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    source evidence_source NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. Smart Questions Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smart_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'single_choice',
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. Answers Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES smart_questions(id) ON DELETE CASCADE,
    selected_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    answer_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_scan_question UNIQUE (scan_id, question_id)
);

-- -----------------------------------------------------------------------------
-- 7. Alternative Possibilities Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alternative_possibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    condition_name VARCHAR(150) NOT NULL,
    confidence NUMERIC(3, 2) CHECK (confidence >= 0.00 AND confidence <= 1.00),
    rationale TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. Action Plans Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    immediate_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    monitoring_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    prevention_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    when_to_seek_expert TEXT,
    disclaimer TEXT NOT NULL DEFAULT 'LeafIQ provides an AI-assisted crop health assessment and should not be treated as a confirmed diagnosis.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. Scan Comparisons Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baseline_scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    followup_scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    trajectory comparison_trajectory NOT NULL DEFAULT 'unclear',
    comparison_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_comparison_pair UNIQUE (baseline_scan_id, followup_scan_id)
);

-- -----------------------------------------------------------------------------
-- 10. Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scans_user_created ON scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_crop_name ON scans(crop_name);
CREATE INDEX IF NOT EXISTS idx_scans_parent ON scans(parent_scan_id);

CREATE INDEX IF NOT EXISTS idx_evidence_scan ON evidence(scan_id, source);
CREATE INDEX IF NOT EXISTS idx_questions_scan ON smart_questions(scan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_answers_scan ON answers(scan_id);
CREATE INDEX IF NOT EXISTS idx_alt_possibilities_scan ON alternative_possibilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_baseline ON scan_comparisons(baseline_scan_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_followup ON scan_comparisons(followup_scan_id);
