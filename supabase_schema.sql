-- Supabase Schema for Beacon Capital

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    issuance TEXT NOT NULL,
    expiry TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isFrozen" BOOLEAN DEFAULT FALSE,
    "frozenReason" TEXT DEFAULT ''
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
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

-- Create inbox_emails table (for incoming emails & replies to support@mail.beaconcapital.site)
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

-- Create email_logs table (for outbound sent emails)
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

-- Indexes for fast email lookups
CREATE INDEX IF NOT EXISTS idx_inbox_emails_received_at ON inbox_emails (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_folder ON inbox_emails (folder);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_is_read ON inbox_emails (is_read);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);

-- Note: Because we are dealing with mock data/testing, we can disable Row Level Security (RLS) for now,
-- or you can configure it via the Supabase Dashboard. 
-- Disabling RLS for quick testing (NOT RECOMMENDED FOR PRODUCTION):
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE inbox_emails DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;
