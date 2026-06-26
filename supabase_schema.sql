-- Supabase Schema for Beacon Capital

-- Create users table
CREATE TABLE users (
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
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
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

-- Note: Because we are dealing with mock data/testing, we can disable Row Level Security (RLS) for now,
-- or you can configure it via the Supabase Dashboard. 
-- Disabling RLS for quick testing (NOT RECOMMENDED FOR PRODUCTION):
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
