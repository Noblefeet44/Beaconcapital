/**
 * Beacon Capital Responsive HTML Email Templates
 * Optimized for High Deliverability & Anti-Spam Compliance.
 * Softens heavy spam-trigger words, uses clean inline formatting, and avoids red-flag phishing heuristics.
 */

const BRAND_NAME = "Beacon Capital";
const BRAND_PRIMARY_COLOR = "#0f172a";
const BRAND_ACCENT_COLOR = "#2563eb";
const SUPPORT_EMAIL = "support@mail.beaconcapital.site";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getBaseHeader(): string {
  return `
    <div style="text-align: center; border-bottom: 2px solid ${BRAND_PRIMARY_COLOR}; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 22px; font-weight: 700; color: ${BRAND_PRIMARY_COLOR}; letter-spacing: 1px; font-family: 'Segoe UI', Arial, sans-serif;">
        ${BRAND_NAME}
      </div>
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
        Account Notifications
      </div>
    </div>
  `;
}

function getBaseFooter(): string {
  return `
    <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-family: sans-serif;">
      <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} ${BRAND_NAME} Services. All rights reserved.</p>
      <p style="margin: 4px 0;">Need help? Contact support at <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ACCENT_COLOR}; text-decoration: none;">${SUPPORT_EMAIL}</a>.</p>
      <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">You received this automated notification regarding your account activity.</p>
    </div>
  `;
}

function wrapLayout(contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Beacon Capital Notification</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .email-card { max-width: 600px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); }
          .item-table { width: 100%; margin: 20px 0; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #e2e8f0; gap: 12px; }
          .item-row:last-child { border-bottom: none; }
          .item-label { color: #64748b; font-size: 13.5px; font-weight: 500; flex-shrink: 0; max-width: 48%; }
          .item-value { text-align: right; color: #0f172a; font-size: 13.5px; font-weight: 500; word-break: break-word; overflow-wrap: break-word; max-width: 52%; }
          .highlight-val { color: ${BRAND_ACCENT_COLOR} !important; font-weight: 600 !important; }
          .bold-val { font-weight: 600 !important; }
          
          @media only screen and (max-width: 480px) {
            body { padding: 6px !important; }
            .email-card { padding: 20px 14px !important; border-radius: 10px !important; }
            .item-table { padding: 8px 12px !important; margin: 16px 0 !important; }
            .item-row { flex-direction: column !important; align-items: flex-start !important; gap: 3px !important; padding: 8px 0 !important; }
            .item-label { max-width: 100% !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: #94a3b8 !important; }
            .item-value { text-align: left !important; max-width: 100% !important; font-size: 13.5px !important; font-weight: 600 !important; width: 100% !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-card">
          ${getBaseHeader()}
          ${contentHtml}
          ${getBaseFooter()}
        </div>
      </body>
    </html>
  `;
}

export interface TableRow {
  label: string;
  value: string;
  isBold?: boolean;
  isHighlight?: boolean;
}

function renderItemizedTable(rows: TableRow[]): string {
  const rowHtml = rows.map(r => {
    let valueClass = "item-value";
    if (r.isHighlight) valueClass += " highlight-val";
    if (r.isBold) valueClass += " bold-val";

    return `
      <div class="item-row">
        <div class="item-label">${r.label}</div>
        <div class="${valueClass}">${r.value}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="item-table">
      ${rowHtml}
    </div>
  `;
}

// ----------------------------------------------------------------------
// 1. WELCOME VERIFICATION EMAIL
// ----------------------------------------------------------------------
export function getWelcomeVerificationEmail(userName: string, verifyUrl: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Welcome to ${BRAND_NAME}</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">Thank you for getting started with ${BRAND_NAME}. Please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${verifyUrl}" style="background-color: ${BRAND_ACCENT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">Confirm Email Address</a>
    </div>

    <p style="color: #64748b; font-size: 13px;">If you did not register for an account, you can safely disregard this message.</p>
  `);
}

// ----------------------------------------------------------------------
// 2. APPLICATION SUBMITTED EMAIL
// ----------------------------------------------------------------------
export function getApplicationSubmittedEmail(userName: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Application Received</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">We have received your account request and our team is reviewing your information.</p>
    
    ${renderItemizedTable([
      { label: "Applicant", value: userName },
      { label: "Status", value: "Under Review", isHighlight: true },
      { label: "Estimated Time", value: "1-2 Business Days" }
    ])}

    <p style="color: #334155; line-height: 1.6;">We will send you another update as soon as the review is complete.</p>
  `);
}

// ----------------------------------------------------------------------
// 3. APPLICATION APPROVED EMAIL
// ----------------------------------------------------------------------
export function getApplicationApprovedEmail(userName: string): string {
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://beaconcapital.site'}/login`;
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 17px; margin: 0 0 6px 0;">✓ Application Approved &amp; Account Activated</h2>
      <p style="color: #15803d; margin: 0; font-size: 13.5px;">Your account review has been completed and your access is now active.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">We are pleased to inform you that your <strong>${BRAND_NAME}</strong> institutional account application has been verified and approved by Customer Service &amp; Compliance.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${BRAND_ACCENT_COLOR}; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: ${BRAND_PRIMARY_COLOR};">How to Log In:</p>
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        You can now access your account portal. Please log in using your registered <strong>Email Address</strong> and the <strong>Password</strong> you created during registration.
      </p>
    </div>

    <div style="text-align: center; margin: 26px 0;">
      <a href="${loginUrl}" style="background-color: ${BRAND_PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Log In to Your Account</a>
    </div>

    <p style="color: #64748b; font-size: 12.5px; line-height: 1.5;">If you experience any issues logging in, please reply to this email or contact support at <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ACCENT_COLOR}; text-decoration: none;">${SUPPORT_EMAIL}</a>.</p>
  `);
}

// ----------------------------------------------------------------------
// 4. APPLICATION REJECTED EMAIL
// ----------------------------------------------------------------------
export function getApplicationRejectedEmail(userName: string, reason: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Account Request Status</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">Thank you for your interest in ${BRAND_NAME}. After reviewing your application details, we are unable to approve your account request at this time.</p>
    
    ${renderItemizedTable([
      { label: "Applicant", value: userName },
      { label: "Status", value: "Not Approved", isBold: true },
      { label: "Notes", value: reason || "Standard account criteria not met" }
    ])}

    <p style="color: #64748b; font-size: 13px;">If you have any questions or need further clarification, please feel free to reach out to support.</p>
  `);
}

// ----------------------------------------------------------------------
// 5. TRANSFER INITIATED (ACH / Wire / Zelle / Bill Pay) EMAIL
// ----------------------------------------------------------------------
export function getTransferInitiatedEmail(data: {
  userName: string;
  transferType: string;
  amount: number;
  fee?: number;
  recipientName: string;
  recipientDetails?: string;
  sendingAccountMask: string;
  referenceNumber: string;
  date: string;
}): string {
  const totalDebit = data.amount + (data.fee || 0);

  const rows: TableRow[] = [
    { label: "Account Holder", value: data.userName },
    { label: "Source Account", value: `Checking (*${data.sendingAccountMask})` },
    { label: "Recipient", value: data.recipientName },
  ];

  if (data.recipientDetails) {
    rows.push({ label: "Details", value: data.recipientDetails });
  }

  rows.push(
    { label: "Transfer Amount", value: formatCurrency(data.amount) },
    { label: "Fee", value: data.fee ? formatCurrency(data.fee) : "$0.00" },
    { label: "Total Amount", value: formatCurrency(totalDebit), isBold: true },
    { label: "Reference", value: data.referenceNumber, isHighlight: true },
    { label: "Date", value: data.date },
    { label: "Status", value: "Processing" }
  );

  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">${data.transferType} Summary</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>
    <p style="color: #334155; line-height: 1.6;">Your <strong>${data.transferType}</strong> has been submitted and is currently being processed.</p>

    ${renderItemizedTable(rows)}
  `);
}

// ----------------------------------------------------------------------
// 5b. RECIPIENT NOTIFICATION (TRANSFER RECEIVED) EMAIL
// ----------------------------------------------------------------------
export function getTransferReceivedEmail(data: {
  senderName: string;
  transferType: string;
  amount: number;
  recipientName?: string;
  referenceNumber: string;
  date: string;
  note?: string;
}): string {
  const rows: TableRow[] = [
    { label: "Sender", value: data.senderName },
    { label: "Payment Method", value: data.transferType },
    { label: "Amount Received", value: formatCurrency(data.amount), isBold: true, isHighlight: true },
    { label: "Reference Number", value: data.referenceNumber },
    { label: "Date & Time", value: data.date },
    { label: "Status", value: "Sent / In Transit" }
  ];

  if (data.note) {
    rows.push({ label: "Memo / Note", value: data.note });
  }

  return wrapLayout(`
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 16px; margin: 0 0 6px 0;">Transfer Notification</h2>
      <p style="color: #475569; margin: 0; font-size: 13.5px;">${data.senderName} has initiated a ${data.transferType} to your details.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello ${data.recipientName || 'Valued Recipient'},</p>
    <p style="color: #334155; line-height: 1.6;">You have received a payment notification from <strong>${data.senderName}</strong>. Below is the summary of your transaction:</p>

    ${renderItemizedTable(rows)}
  `);
}


// ----------------------------------------------------------------------
// 6. TRANSFER SETTLED EMAIL
// ----------------------------------------------------------------------
export function getTransferSettledEmail(data: {
  userName: string;
  transferType: string;
  amount: number;
  recipientName: string;
  referenceNumber: string;
  date: string;
}): string {
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 16px; margin: 0 0 6px 0;">Transfer Completed</h2>
      <p style="color: #15803d; margin: 0; font-size: 13.5px;">Your transfer has been successfully processed.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>
    
    ${renderItemizedTable([
      { label: "Type", value: data.transferType },
      { label: "Recipient", value: data.recipientName },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference", value: data.referenceNumber, isHighlight: true },
      { label: "Date", value: data.date },
      { label: "Status", value: "Completed" }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 7. TRANSFER REJECTED EMAIL
// ----------------------------------------------------------------------
export function getTransferRejectedEmail(data: {
  userName: string;
  transferType: string;
  amount: number;
  referenceNumber: string;
  reason?: string;
}): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Transfer Update</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>
    <p style="color: #334155; line-height: 1.6;">Your <strong>${data.transferType}</strong> request could not be completed. Any funds reserved for this transfer remain in your account balance.</p>

    ${renderItemizedTable([
      { label: "Type", value: data.transferType },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference", value: data.referenceNumber },
      { label: "Notes", value: data.reason || "Unable to process request" },
      { label: "Status", value: "Returned" }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 8. MOBILE CHECK DEPOSIT PENDING EMAIL
// ----------------------------------------------------------------------
export function getDepositReceivedPendingEmail(data: {
  userName: string;
  targetAccountName: string;
  targetAccountMask: string;
  amount: number;
  referenceNumber: string;
  date: string;
}): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Deposit Received</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>
    <p style="color: #334155; line-height: 1.6;">We have received your check deposit image. It is currently being processed by our system.</p>

    ${renderItemizedTable([
      { label: "Account Holder", value: data.userName },
      { label: "Destination Account", value: `${data.targetAccountName} (*${data.targetAccountMask})` },
      { label: "Deposit Amount", value: formatCurrency(data.amount) },
      { label: "Reference", value: data.referenceNumber, isHighlight: true },
      { label: "Date & Time", value: data.date },
      { label: "Status", value: "Processing" }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 9. MOBILE CHECK DEPOSIT SETTLED EMAIL
// ----------------------------------------------------------------------
export function getDepositSettledEmail(data: {
  userName: string;
  targetAccountMask: string;
  amount: number;
  referenceNumber: string;
}): string {
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 16px; margin: 0 0 6px 0;">Deposit Confirmed</h2>
      <p style="color: #15803d; margin: 0; font-size: 13.5px;">Your deposited funds are now available.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>

    ${renderItemizedTable([
      { label: "Account", value: `Account (*${data.targetAccountMask})` },
      { label: "Cleared Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference", value: data.referenceNumber, isHighlight: true },
      { label: "Status", value: "Available" }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 10. LEDGER ADJUSTMENT NOTICE EMAIL
// ----------------------------------------------------------------------
export function getLedgerAdjustmentNoticeEmail(data: {
  userName: string;
  accountMask: string;
  adjustmentType: "credit" | "debit";
  method: string;
  amount: number;
  reference?: string;
  date: string;
}): string {
  const isCredit = data.adjustmentType === "credit";
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Account Balance Notice</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${data.userName},</p>
    <p style="color: #334155; line-height: 1.6;">A balance update has been posted to your ${BRAND_NAME} account.</p>

    ${renderItemizedTable([
      { label: "Account", value: `Account (*${data.accountMask})` },
      { label: "Type", value: isCredit ? "Credit (+)" : "Debit (-)" },
      { label: "Description", value: data.method },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference", value: data.reference || "N/A" },
      { label: "Effective Date", value: data.date }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 11. ACCOUNT FROZEN SECURITY ALERT EMAIL
// ----------------------------------------------------------------------
export function getAccountFrozenEmail(userName: string, reason: string): string {
  return wrapLayout(`
    <div style="background-color: #fffbebf1; border: 1px solid #fef3c7; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #92400e; font-size: 16px; margin: 0 0 6px 0;">Account Notice: Action Required</h2>
      <p style="color: #b45309; margin: 0; font-size: 13.5px;">Temporary security hold placed on your account.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">A routine security check has placed a temporary hold on your ${BRAND_NAME} account online activity.</p>

    ${renderItemizedTable([
      { label: "Account Holder", value: userName },
      { label: "Reason", value: reason || "Routine account check" },
      { label: "Next Step", value: "Contact Support" }
    ])}

    <p style="color: #334155; line-height: 1.6;">To resume full access, please get in touch with our team at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `);
}

// ----------------------------------------------------------------------
// 12. ACCOUNT UNFROZEN SECURITY NOTICE EMAIL
// ----------------------------------------------------------------------
export function getAccountUnfrozenEmail(userName: string): string {
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 16px; margin: 0 0 6px 0;">Account Access Restored</h2>
      <p style="color: #15803d; margin: 0; font-size: 13.5px;">Your account access is fully active.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">We are pleased to notify you that your ${BRAND_NAME} account hold has been resolved. Full portal access is restored.</p>
  `);
}

// ----------------------------------------------------------------------
// 13. PASSWORD RESET EMAIL
// ----------------------------------------------------------------------
export function getPasswordResetEmail(userName: string, resetUrl: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #334155; line-height: 1.6;">Hello ${userName},</p>
    <p style="color: #334155; line-height: 1.6;">We received a request to reset your ${BRAND_NAME} account password. Click below to choose a new password:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="background-color: ${BRAND_ACCENT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>

    <p style="color: #64748b; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
  `);
}

// ----------------------------------------------------------------------
// 14. ADMIN NEW APPLICANT ALERT EMAIL
// ----------------------------------------------------------------------
export function getAdminNewApplicantEmail(applicantName: string, applicantEmail: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">New Application Submitted</h2>
    <p style="color: #334155; line-height: 1.6;">A new user application is waiting for review.</p>

    ${renderItemizedTable([
      { label: "Applicant", value: applicantName },
      { label: "Email", value: applicantEmail },
      { label: "Queue Status", value: "Pending Verification", isHighlight: true }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 15. ADMIN HIGH VALUE TRANSACTION ALERT EMAIL
// ----------------------------------------------------------------------
export function getAdminHighValueTxEmail(data: {
  userName: string;
  transferType: string;
  amount: number;
  referenceNumber: string;
}): string {
  return wrapLayout(`
    <div style="background-color: #fffbebf1; border: 1px solid #fef3c7; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #92400e; font-size: 16px; margin: 0 0 6px 0;">Transfer Notification</h2>
      <p style="color: #b45309; margin: 0; font-size: 13.5px;">Standard notification threshold met.</p>
    </div>

    ${renderItemizedTable([
      { label: "Customer", value: data.userName },
      { label: "Type", value: data.transferType },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference", value: data.referenceNumber, isHighlight: true }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 16. GENERAL-PURPOSE SUPPORT / COMPOSE EMAIL
// ----------------------------------------------------------------------
export function getSupportEmail(data: {
  recipientName?: string;
  messageBody: string;
  senderLabel?: string;
}): string {
  // Convert newlines in the message body to <br> for HTML rendering
  const formattedBody = data.messageBody
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 18px; margin-top: 0;">${BRAND_NAME}</h2>
    ${data.recipientName ? `<p style="color: #334155; line-height: 1.6;">Hello ${data.recipientName},</p>` : ''}
    <div style="color: #334155; line-height: 1.7; font-size: 14px; white-space: pre-wrap;">
      ${formattedBody}
    </div>
    ${data.senderLabel ? `
      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 13px; margin: 0;">Sent by <strong style="color: #334155;">${data.senderLabel}</strong></p>
      </div>
    ` : ''}
  `);
}

/**
 * Converts an HTML email string into a clean, human-readable plain text string
 * for dual MIME (multipart/alternative) transmission, significantly lowering spam scores.
 */
export function htmlToPlainText(html: string): string {
  let text = html;
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&copy;/g, '©');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  return text.trim();
}

