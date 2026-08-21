import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { htmlToPlainText } from '@/lib/email-templates';

// Initialize Resend client with API key from environment
export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

export interface SendEmailParams {
  to: string;
  from?: string;
  subject: string;
  templateName: string;
  html: string;
  text?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function sendEmail({
  to,
  from = process.env.SENDER_PAYMENTS || 'Beacon Capital Payments <payments@mail.beaconcapital.site>',
  subject,
  templateName,
  html,
  text,
  userId,
  metadata = {}
}: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[Resend Warning] RESEND_API_KEY is not set. Email "${subject}" to ${to} was logged but not dispatched.`);
    }

    const plainText = text || htmlToPlainText(html);

    // 1. Send email via Resend API with dual MIME (HTML + Plain Text)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: plainText,
    });

    if (error) {
      console.error(`[Resend Error] Failed to send template "${templateName}" to ${to}:`, error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as any).message
        : String(error);
      return { success: false, error: errorMessage };
    }

    // 2. Audit log into Supabase email_logs table
    try {
      await supabase.from('email_logs').insert({
        user_id: userId || null,
        recipient_email: to,
        sender_email: from,
        subject,
        template_name: templateName,
        resend_id: data?.id || null,
        status: 'sent',
        metadata,
      });
    } catch (dbErr) {
      console.error(`[Supabase Audit Error] Failed to write email log for ${templateName}:`, dbErr);
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error(`[Email Exception] ${templateName}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}
