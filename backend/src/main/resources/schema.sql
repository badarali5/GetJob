-- Local compatibility patch for legacy job schema.
-- Current application persists `company_name` and does not require `company_id`.
ALTER TABLE IF EXISTS job ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE IF EXISTS job ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
