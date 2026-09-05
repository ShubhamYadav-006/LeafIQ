-- =============================================================================
-- LeafIQ Migration 002: Allow Guest Scans
-- Makes scans.user_id nullable so guests can analyze crops without login
-- =============================================================================

ALTER TABLE scans ALTER COLUMN user_id DROP NOT NULL;

-- Create index for faster lookup of guest scans and unclaimed scans
CREATE INDEX IF NOT EXISTS idx_scans_guest_lookup ON scans (id) WHERE user_id IS NULL;
