-- Email Audit Logs Table for Supabase
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    resend_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to email_logs" ON public.email_logs;
CREATE POLICY "Allow public insert to email_logs" 
ON public.email_logs 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read of email_logs" ON public.email_logs;
CREATE POLICY "Allow public read of email_logs" 
ON public.email_logs 
FOR SELECT 
TO anon, authenticated 
USING (true);

