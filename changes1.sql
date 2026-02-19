-- SME CyberGuard Agent - Database Schema Changes
-- Changes1.sql - Additional tables and columns for onboarding and activation codes
-- Run this file after schema.sql has been executed

-- Add onboarding questions to users table
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN heard_about_us TEXT; -- Onboarding question 1
ALTER TABLE users ADD COLUMN business_size TEXT; -- Onboarding question 2: small, medium, large
ALTER TABLE users ADD COLUMN primary_concern TEXT; -- Onboarding question 3: data_security, malware, compliance, etc.
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN onboarding_completed_at DATETIME;

-- Add business details that will be collected during onboarding
ALTER TABLE businesses ADD COLUMN phone TEXT;
ALTER TABLE businesses ADD COLUMN owner_name TEXT;

-- Create activation codes table (replaces agent_activation_tokens)
CREATE TABLE IF NOT EXISTS activation_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- Format: rax-XXXXXX-XXXX (e.g., rax-A1B2C3-D4E5)
    business_id TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, revoked, expired
    created_by TEXT, -- user_id who created it
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    revoked_by TEXT, -- user_id who revoked it
    revoked_reason TEXT,
    expires_at DATETIME NOT NULL,
    last_used_at DATETIME,
    used_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT -1, -- -1 means unlimited
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (revoked_by) REFERENCES users(id)
);

-- Create activation code usage log
CREATE TABLE IF NOT EXISTS activation_code_usage (
    id TEXT PRIMARY KEY,
    activation_code_id TEXT NOT NULL,
    device_id TEXT,
    hostname TEXT,
    ip_address TEXT,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT 1,
    failure_reason TEXT,
    FOREIGN KEY (activation_code_id) REFERENCES activation_codes(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Function to generate activation code with 'rax' prefix
-- This will be implemented in the application code, but here's the format:
-- Format: rax-[6 chars]-[4 chars]
-- Example: rax-A1B2C3-D4E5, rax-F6G7H8-I9J0

-- Indexes for activation codes
CREATE INDEX IF NOT EXISTS idx_activation_codes_business ON activation_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
CREATE INDEX IF NOT EXISTS idx_activation_codes_expires ON activation_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_activation_code_usage_code ON activation_code_usage(activation_code_id);
CREATE INDEX IF NOT EXISTS idx_activation_code_usage_device ON activation_code_usage(device_id);

-- Indexes for new user columns
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_heard_about ON users(heard_about_us);

-- Trigger to auto-increment used_count when activation code is used
CREATE TRIGGER IF NOT EXISTS increment_activation_code_usage
AFTER INSERT ON activation_code_usage
WHEN NEW.success = 1
BEGIN
    UPDATE activation_codes
    SET used_count = used_count + 1,
        last_used_at = NEW.used_at
    WHERE id = NEW.activation_code_id;
END;

-- Trigger to prevent usage of revoked or expired codes
-- Note: This validation should primarily happen in application logic,
-- but we can add constraints here

-- Update existing agent_activation_tokens usage to work with new system
-- Migration note: If you have existing tokens, you might want to migrate them:
-- INSERT INTO activation_codes (id, code, business_id, status, expires_at, created_at, max_uses)
-- SELECT token, token, business_id, CASE WHEN used_at IS NOT NULL THEN 'used' ELSE 'active' END, expires_at, created_at, 1
-- FROM agent_activation_tokens;

-- Add some helpful views
CREATE VIEW IF NOT EXISTS active_activation_codes AS
SELECT 
    ac.id,
    ac.code,
    ac.business_id,
    b.name as business_name,
    ac.created_at,
    ac.expires_at,
    ac.used_count,
    ac.max_uses,
    ac.last_used_at,
    CASE 
        WHEN ac.status = 'revoked' THEN 'Revoked'
        WHEN ac.expires_at < datetime('now') THEN 'Expired'
        WHEN ac.max_uses > 0 AND ac.used_count >= ac.max_uses THEN 'Limit Reached'
        ELSE 'Active'
    END as effective_status
FROM activation_codes ac
JOIN businesses b ON ac.business_id = b.id
WHERE ac.status != 'revoked' AND ac.expires_at > datetime('now');

-- Add comments/documentation
-- Onboarding Questions:
-- 1. heard_about_us: Options include 'social_media', 'search_engine', 'referral', 'advertisement', 'other'
-- 2. business_size: Options include 'small' (1-10 employees), 'medium' (11-50), 'large' (50+)
-- 3. primary_concern: Options include 'data_security', 'malware_protection', 'compliance', 'employee_monitoring', 'general_protection'
