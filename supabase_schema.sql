-- ==============================================================================
-- Supabase SQL Schema for Beacon Capital
-- Run this script in your Supabase SQL Editor to set up all tables and seed data.
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    dob TEXT NOT NULL DEFAULT '',
    "idType" TEXT NOT NULL DEFAULT 'dl',
    "idNumber" TEXT NOT NULL DEFAULT '',
    issuance TEXT NOT NULL DEFAULT '',
    expiry TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isFrozen" BOOLEAN DEFAULT FALSE,
    "frozenReason" TEXT DEFAULT '',
    "rejectionReason" TEXT DEFAULT ''
);

-- Migration safety for existing installations
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT DEFAULT '';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS "isFrozen" BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS "frozenReason" TEXT DEFAULT '';

-- 2. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    "effectiveDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isOverride" BOOLEAN DEFAULT FALSE,
    "overrideReason" TEXT DEFAULT '',
    "authCode" TEXT DEFAULT '',
    justification TEXT DEFAULT '',
    "recipientDetails" TEXT DEFAULT ''
);

-- 4. INBOX EMAILS TABLE (Inbound messages & replies)
CREATE TABLE IF NOT EXISTS inbox_emails (
    id TEXT PRIMARY KEY,
    sender_name TEXT DEFAULT 'External Sender',
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL DEFAULT 'support@mail.beaconcapital.site',
    subject TEXT NOT NULL,
    body_text TEXT DEFAULT '',
    body_html TEXT DEFAULT '',
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    folder TEXT NOT NULL DEFAULT 'inbox',
    reply_to TEXT,
    message_id TEXT,
    headers JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    thread_id TEXT
);

-- 5. EMAIL LOGS TABLE (Outbound sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,
    recipient_email TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT,
    resend_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts ("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_accountId ON transactions ("accountId");
CREATE INDEX IF NOT EXISTS idx_transactions_createdAt ON transactions ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_received_at ON inbox_emails (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_folder ON inbox_emails (folder);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_is_read ON inbox_emails (is_read);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);

-- ==============================================================================
-- 7. SEED DATA (Default Admin, Demo Users, Sample Accounts & Transactions)
-- Default password for all demo accounts below is: password123
-- ==============================================================================

-- Admin Account (username: admin, password: password123)
INSERT INTO users (id, username, "passwordHash", "firstName", "lastName", phone, dob, "idType", "idNumber", issuance, expiry, role, status, "createdAt", "isFrozen")
VALUES 
('u-admin', 'admin', '$2a$10$VwzqSEnGe8IbuSZ00zVAEONNnyTiaj9qX.qrpBc4c/sE7/KLqAwiW', 'Chief', 'Compliance Officer', '+1 (555) 010-0000', '1980-01-01', 'passport', 'ADMIN-001', 'Beacon Authority', '2035-01-01', 'admin', 'Active', NOW(), FALSE)
ON CONFLICT (username) DO NOTHING;

-- Demo Active User 1: Alexander Hamilton
INSERT INTO users (id, username, "passwordHash", "firstName", "lastName", phone, dob, "idType", "idNumber", issuance, expiry, role, status, "createdAt", "isFrozen")
VALUES 
('u-alexander', 'alexander@beaconcapital.site', '$2a$10$VwzqSEnGe8IbuSZ00zVAEONNnyTiaj9qX.qrpBc4c/sE7/KLqAwiW', 'Alexander', 'Hamilton', '+1 (555) 019-2834', '1985-01-11', 'dl', 'DL-8492048-NY', 'New York', '2029-01-11', 'user', 'Active', NOW() - INTERVAL '30 days', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Demo Active User 2: Eleanor Vance
INSERT INTO users (id, username, "passwordHash", "firstName", "lastName", phone, dob, "idType", "idNumber", issuance, expiry, role, status, "createdAt", "isFrozen")
VALUES 
('u-eleanor', 'eleanor@beaconcapital.site', '$2a$10$VwzqSEnGe8IbuSZ00zVAEONNnyTiaj9qX.qrpBc4c/sE7/KLqAwiW', 'Eleanor', 'Vance', '+1 (555) 392-4910', '1978-10-12', 'passport', 'PP-482019-US', 'United States', '2032-10-12', 'user', 'Active', NOW() - INTERVAL '60 days', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Demo Pending Applicant: Philip Weeks (Waiting for admin approval)
INSERT INTO users (id, username, "passwordHash", "firstName", "lastName", phone, dob, "idType", "idNumber", issuance, expiry, role, status, "createdAt", "isFrozen")
VALUES 
('u-philip', 'philip.weeks@example.com', '$2a$10$VwzqSEnGe8IbuSZ00zVAEONNnyTiaj9qX.qrpBc4c/sE7/KLqAwiW', 'Philip', 'Weeks', '+1 (555) 123-4567', '1998-06-24', 'dl', 'DL-PHILIP-12', 'NY', '2030-06-24', 'user', 'Pending', NOW() - INTERVAL '2 hours', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Accounts for Alexander
INSERT INTO accounts (id, "userId", "accountNumber", "accountType", "accountName", balance, "createdAt")
VALUES 
('acc-alex-chk', 'u-alexander', '...4829', 'checking', 'Beacon Premier Checking', 142500.00, NOW() - INTERVAL '30 days'),
('acc-alex-sav', 'u-alexander', '...9102', 'savings', 'Beacon High-Yield Treasury Savings', 850000.00, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Accounts for Eleanor
INSERT INTO accounts (id, "userId", "accountNumber", "accountType", "accountName", balance, "createdAt")
VALUES 
('acc-eleanor-chk', 'u-eleanor', '...3910', 'checking', 'Beacon Commercial Operating', 520000.00, NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- Accounts for Philip (Pending applicant default accounts with 0 balance)
INSERT INTO accounts (id, "userId", "accountNumber", "accountType", "accountName", balance, "createdAt")
VALUES 
('acc-philip-chk', 'u-philip', '...8491', 'checking', 'Beacon Premier Checking', 0.00, NOW() - INTERVAL '2 hours'),
('acc-philip-sav', 'u-philip', '...8492', 'savings', 'Beacon High-Yield Savings', 0.00, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Sample Inbox Emails
INSERT INTO inbox_emails (id, sender_name, sender_email, recipient_email, subject, body_text, body_html, received_at, is_read, is_starred, folder)
VALUES 
('inbox_seed_1', 'Marcus Vance', 'marcus.vance@vanceholdings.com', 'support@mail.beaconcapital.site', 'Inquiry regarding Institutional Wire Settlement Timelines', 'Hello Support Team,\n\nWe are preparing a wire disbursement for our commercial account and would like to confirm the daily cut-off times for same-day Fedwire settlement.\n\nBest regards,\nMarcus Vance', '<p>Hello Support Team,<br/><br/>We are preparing a wire disbursement for our commercial account and would like to confirm the daily cut-off times for same-day Fedwire settlement.<br/><br/>Best regards,<br/><strong>Marcus Vance</strong></p>', NOW() - INTERVAL '45 minutes', FALSE, TRUE, 'inbox'),
('inbox_seed_2', 'Eleanor Sterling', 'e.sterling@sterlingpartners.io', 'support@mail.beaconcapital.site', 'Re: Application Approved - Beacon Capital Institutional Account', 'Thank you for the quick approval on our institutional account setup. We have uploaded our authorized signatory roster.\n\nWarm regards,\nEleanor Sterling', '<p>Thank you for the quick approval on our institutional account setup. We have uploaded our authorized signatory roster.<br/><br/>Warm regards,<br/><strong>Eleanor Sterling</strong></p>', NOW() - INTERVAL '3 hours', TRUE, FALSE, 'inbox')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) SETTINGS
-- For testing / internal backend API usage, you can disable RLS or allow all operations:
-- ==============================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;
