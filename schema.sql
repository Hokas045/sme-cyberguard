-- SME CyberGuard Agent - Turso Database Schema
-- Multi-tenant, threat-aware, dashboard-ready

-- Business entities
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    subscription_status TEXT DEFAULT 'trial',
    subscription_tier TEXT DEFAULT 'free',
    subscription_started_at DATETIME,
    subscription_expires_at DATETIME,
    trial_started_at DATETIME,
    trial_ends_at DATETIME,
    max_devices INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    business_name TEXT,
    role TEXT DEFAULT 'admin',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Device management
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    hostname TEXT NOT NULL,
    os TEXT,
    os_version TEXT,
    agent_version TEXT,
    last_seen DATETIME,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS agent_activation_tokens (
    token TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    used_by_device TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Telemetry tables
CREATE TABLE IF NOT EXISTS software_inventory (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT,
    publisher TEXT,
    install_date DATETIME,
    is_outdated BOOLEAN DEFAULT 0,
    latest_version TEXT,
    severity TEXT,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    path TEXT NOT NULL,
    hash TEXT,
    parent_process TEXT,
    is_threat BOOLEAN DEFAULT 0,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS network_connections (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    dest_ip TEXT NOT NULL,
    dest_port INTEGER,
    protocol TEXT,
    process_path TEXT,
    is_suspicious BOOLEAN DEFAULT 0,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS user_logins (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    username TEXT NOT NULL,
    login_time DATETIME NOT NULL,
    ip_address TEXT,
    is_anomaly BOOLEAN DEFAULT 0,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS threat_alerts (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS phishing_simulations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    campaign_name TEXT,
    sent_at DATETIME NOT NULL,
    clicked_by TEXT,
    clicked_at DATETIME,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS risk_score_history (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Quarantine management
CREATE TABLE IF NOT EXISTS quarantined_threats (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    hash TEXT NOT NULL,
    quarantine_path TEXT NOT NULL,
    original_path TEXT,
    process_killed BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'quarantined',
    threat_type TEXT,
    file_size INTEGER,
    quarantined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    action_taken TEXT,
    action_at DATETIME,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Remote commands for business owner control
CREATE TABLE IF NOT EXISTS remote_commands (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    command TEXT NOT NULL,
    target TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    executed_at DATETIME,
    created_by TEXT,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Web threat detection
CREATE TABLE IF NOT EXISTS web_threats (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    action TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    reason TEXT,
    user_warned BOOLEAN DEFAULT 1,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- USB activity tracking
CREATE TABLE IF NOT EXISTS usb_activity (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    action TEXT NOT NULL,
    drive_letter TEXT,
    threats_found INTEGER DEFAULT 0,
    details TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Patch management
CREATE TABLE IF NOT EXISTS patch_status (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    pending_updates INTEGER DEFAULT 0,
    critical_updates INTEGER DEFAULT 0,
    last_checked DATETIME,
    status TEXT,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Threat intelligence updates
CREATE TABLE IF NOT EXISTS threat_intelligence_updates (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    hash_count INTEGER DEFAULT 0,
    domain_count INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Global threat intelligence (PUBLIC - shared across all businesses)
CREATE TABLE IF NOT EXISTS global_threat_intelligence (
    id TEXT PRIMARY KEY,
    threat_type TEXT NOT NULL,
    threat_value TEXT NOT NULL UNIQUE,
    severity TEXT DEFAULT 'medium',
    times_detected INTEGER DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT 0
);

-- Business custom blocked domains (owner-defined)
CREATE TABLE IF NOT EXISTS business_blocked_domains (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    reason TEXT,
    block_type TEXT DEFAULT 'warn',
    added_by TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    UNIQUE(business_id, domain)
);

-- Agent tamper attempts
CREATE TABLE IF NOT EXISTS agent_tamper_attempts (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    tamper_type TEXT NOT NULL,
    details TEXT,
    user_account TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Pricing and Subscription Management
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier_code TEXT UNIQUE NOT NULL,
    description TEXT,
    max_devices INTEGER NOT NULL,
    monthly_price_usd INTEGER NOT NULL,
    yearly_price_usd INTEGER NOT NULL,
    features TEXT, -- JSON string of features
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL UNIQUE,
    pricing_tier_id TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, cancelled, expired, past_due
    billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
    current_period_start DATETIME NOT NULL,
    current_period_end DATETIME NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT 0,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers(id)
);

CREATE TABLE IF NOT EXISTS subscription_trials (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL UNIQUE,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ends_at DATETIME NOT NULL,
    extended_count INTEGER DEFAULT 0,
    converted_to_paid BOOLEAN DEFAULT 0,
    converted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    paystack_reference TEXT UNIQUE,
    paystack_transaction_id TEXT,
    amount_usd INTEGER NOT NULL,
    amount_local INTEGER,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- pending, success, failed, cancelled
    payment_method TEXT,
    billing_cycle TEXT,
    pricing_tier_id TEXT,
    subscription_id TEXT,
    failure_reason TEXT,
    metadata TEXT, -- JSON string for additional data
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE TABLE IF NOT EXISTS subscription_changes (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    from_tier_id TEXT,
    to_tier_id TEXT NOT NULL,
    change_type TEXT NOT NULL, -- upgrade, downgrade, cancel
    effective_date DATETIME NOT NULL,
    proration_amount INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (from_tier_id) REFERENCES pricing_tiers(id),
    FOREIGN KEY (to_tier_id) REFERENCES pricing_tiers(id)
);

-- Audit logs for compliance and security
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- webhook_received, subscription_activated, payment_failed, etc.
    event_source TEXT NOT NULL, -- paystack_webhook, user_action, system
    event_data TEXT, -- JSON string with event details
    ip_address TEXT,
    user_agent TEXT,
    business_id TEXT, -- Optional, for business-specific events
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Insert default pricing tiers
INSERT OR IGNORE INTO pricing_tiers (id, name, tier_code, description, max_devices, monthly_price_usd, yearly_price_usd, features) VALUES
('tier_free', 'Free', 'free', 'Basic cybersecurity protection for startups and very small businesses', 5, 0, 0, '["Up to 5 devices", "Basic threat monitoring", "Risk score dashboard", "Email alerts", "Community support"]'),
('tier_starter', 'Starter', 'starter', 'Essential protection for small businesses with up to 10 computers', 10, 23, 248, '["Up to 10 devices", "Real-time threat monitoring", "Risk score dashboard", "Email alerts", "Basic phishing protection", "Weekly security reports", "Email support"]'),
('tier_professional', 'Professional', 'professional', 'Advanced security for growing SMEs with up to 25 computers', 25, 46, 496, '["Up to 25 devices", "Everything in Starter", "Advanced threat detection", "SMS + WhatsApp alerts", "Phishing simulation campaigns", "Daily detailed reports", "Priority phone support", "Remote security commands", "Compliance monitoring"]'),
('tier_enterprise', 'Enterprise', 'enterprise', 'Comprehensive security solutions for large organizations', -1, 0, 0, '["Unlimited devices", "Everything in Professional", "Dedicated security analyst", "Custom API integrations", "Advanced compliance reports", "24/7 phone support", "On-site security training", "Custom SLA agreements"]');

-- Trigger to update business max_devices when subscription changes
CREATE TRIGGER IF NOT EXISTS update_business_max_devices
AFTER INSERT ON subscriptions
BEGIN
    UPDATE businesses
    SET max_devices = (SELECT max_devices FROM pricing_tiers WHERE id = NEW.pricing_tier_id),
        subscription_status = 'active',
        subscription_tier = (SELECT tier_code FROM pricing_tiers WHERE id = NEW.pricing_tier_id),
        subscription_started_at = NEW.current_period_start,
        subscription_expires_at = NEW.current_period_end
    WHERE id = NEW.business_id;
END;

CREATE TRIGGER IF NOT EXISTS update_business_on_subscription_update
AFTER UPDATE ON subscriptions
WHEN NEW.status != OLD.status
BEGIN
    UPDATE businesses
    SET subscription_status = NEW.status,
        subscription_expires_at = CASE
            WHEN NEW.status = 'cancelled' THEN NEW.current_period_end
            ELSE subscription_expires_at
        END
    WHERE id = NEW.business_id;
END;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_business ON devices(business_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_software_device ON software_inventory(device_id);
CREATE INDEX IF NOT EXISTS idx_processes_device ON processes(device_id);
CREATE INDEX IF NOT EXISTS idx_processes_hash ON processes(hash);
CREATE INDEX IF NOT EXISTS idx_network_device ON network_connections(device_id);
CREATE INDEX IF NOT EXISTS idx_threats_business ON threat_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threat_alerts(status);
CREATE INDEX IF NOT EXISTS idx_activation_token ON agent_activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_quarantine_device ON quarantined_threats(device_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_status ON quarantined_threats(status);
CREATE INDEX IF NOT EXISTS idx_commands_device ON remote_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON remote_commands(status);

-- Indexes for subscription and payment tables
CREATE INDEX IF NOT EXISTS idx_businesses_subscription ON businesses(subscription_status, subscription_tier);
CREATE INDEX IF NOT EXISTS idx_businesses_trial ON businesses(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_trials_business ON subscription_trials(business_id);
CREATE INDEX IF NOT EXISTS idx_trials_ends ON subscription_trials(ends_at);
CREATE INDEX IF NOT EXISTS idx_payments_business ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payment_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tier_code ON pricing_tiers(tier_code);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_business ON subscription_changes(business_id);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_effective ON subscription_changes(effective_date);

-- Agent downloads tracking
CREATE TABLE IF NOT EXISTS agent_downloads (
    id TEXT PRIMARY KEY,
    business_id TEXT, -- NULL for anonymous downloads
    user_id TEXT, -- NULL for non-logged-in users
    platform TEXT NOT NULL, -- windows, mac, linux
    version TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    country TEXT, -- Detected from IP
    referrer TEXT, -- Where they came from
    download_url TEXT,
    file_size INTEGER,
    status TEXT DEFAULT 'completed', -- completed, failed, cancelled
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_source ON audit_logs(event_source);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Notifications system (separate from threat alerts for billing, system maintenance, compliance)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    user_id TEXT,
    type TEXT NOT NULL, -- billing, maintenance, compliance, security, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- low, normal, high, critical
    status TEXT DEFAULT 'unread', -- unread, read, archived
    action_url TEXT, -- Optional link for action
    action_text TEXT, -- Button text for action
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- API Management for integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    permissions TEXT NOT NULL, -- JSON array of permissions
    rate_limit INTEGER DEFAULT 1000,
    expires_at DATETIME,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS api_logs (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER, -- milliseconds
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);

-- Session tracking for security monitoring and GDPR compliance
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    device_info TEXT, -- JSON with device details
    location TEXT, -- City, Country from IP
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Device Groups for scalable management
CREATE TABLE IF NOT EXISTS device_groups (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_group_id TEXT, -- For hierarchical groups
    policies TEXT, -- JSON with group policies
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (parent_group_id) REFERENCES device_groups(id)
);

CREATE TABLE IF NOT EXISTS device_group_memberships (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (group_id) REFERENCES device_groups(id),
    UNIQUE(device_id, group_id)
);

-- Scheduled Tasks for automated security operations
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL, -- scan, update, report, backup, etc.
    schedule TEXT NOT NULL, -- cron expression or simple interval
    target_devices TEXT, -- JSON array of device IDs or "all"
    target_groups TEXT, -- JSON array of group IDs
    parameters TEXT, -- JSON with task-specific parameters
    is_active BOOLEAN DEFAULT 1,
    last_run_at DATETIME,
    next_run_at DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS scheduled_task_runs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT DEFAULT 'running', -- running, completed, failed
    result TEXT, -- JSON with execution results
    error_message TEXT,
    devices_affected INTEGER DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id)
);

-- Incidents for professional incident response tracking
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL, -- low, medium, high, critical
    status TEXT DEFAULT 'open', -- open, investigating, contained, resolved, closed
    incident_type TEXT NOT NULL, -- malware, phishing, unauthorized_access, etc.
    affected_devices TEXT, -- JSON array of affected device IDs
    affected_users TEXT, -- JSON array of affected user IDs
    root_cause TEXT,
    resolution TEXT,
    assigned_to TEXT, -- User ID of assigned responder
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    sla_breach BOOLEAN DEFAULT 0,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    detected_at DATETIME,
    resolved_at DATETIME,
    closed_at DATETIME,
    created_by TEXT,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS incident_comments (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT 0, -- Internal notes vs customer-visible
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS incident_attachments (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Compliance tracking for regulated industries
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- GDPR, HIPAA, PCI-DSS, etc.
    description TEXT,
    version TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
    id TEXT PRIMARY KEY,
    framework_id TEXT NOT NULL,
    requirement_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- technical, organizational, etc.
    frequency TEXT, -- daily, weekly, monthly, quarterly, annually
    automation_possible BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id)
);

CREATE TABLE IF NOT EXISTS compliance_assessments (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    framework_id TEXT NOT NULL,
    assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    assessor TEXT,
    overall_score INTEGER, -- 0-100
    status TEXT DEFAULT 'in_progress', -- in_progress, completed, failed
    next_assessment_date DATETIME,
    report_path TEXT, -- Path to detailed report
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id)
);

CREATE TABLE IF NOT EXISTS compliance_check_results (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    requirement_id TEXT NOT NULL,
    status TEXT NOT NULL, -- compliant, non_compliant, not_applicable
    evidence TEXT, -- Description of evidence
    remediation_required BOOLEAN DEFAULT 0,
    remediation_deadline DATETIME,
    notes TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES compliance_assessments(id),
    FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id)
);

-- Indexes for agent downloads
CREATE INDEX IF NOT EXISTS idx_agent_downloads_business ON agent_downloads(business_id);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_platform ON agent_downloads(platform);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_country ON agent_downloads(country);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_created_at ON agent_downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_status ON agent_downloads(status);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_business ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Indexes for API management
CREATE INDEX IF NOT EXISTS idx_api_keys_business ON api_keys(business_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON api_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_business ON user_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Indexes for device groups
CREATE INDEX IF NOT EXISTS idx_device_groups_business ON device_groups(business_id);
CREATE INDEX IF NOT EXISTS idx_device_groups_parent ON device_groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_device_group_memberships_device ON device_group_memberships(device_id);
CREATE INDEX IF NOT EXISTS idx_device_group_memberships_group ON device_group_memberships(group_id);

-- Indexes for scheduled tasks
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_business ON scheduled_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type ON scheduled_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active ON scheduled_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_task_runs_task ON scheduled_task_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_task_runs_status ON scheduled_task_runs(status);

-- Indexes for incidents
CREATE INDEX IF NOT EXISTS idx_incidents_business ON incidents(business_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON incidents(reported_at);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON incident_comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident ON incident_attachments(incident_id);

-- Indexes for compliance
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_business ON compliance_assessments(business_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_date ON compliance_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_compliance_check_results_assessment ON compliance_check_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_compliance_check_results_requirement ON compliance_check_results(requirement_id);
