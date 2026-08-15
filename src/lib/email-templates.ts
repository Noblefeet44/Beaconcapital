/**
 * Beacon Capital Responsive HTML Email Templates
 * Includes 15 comprehensive templates with itemized details, modern typography, and brand styling.
 */

const BRAND_NAME = "BEACON CAPITAL";
const BRAND_PRIMARY_COLOR = "#0f172a";
const BRAND_ACCENT_COLOR = "#2563eb";
const SUPPORT_EMAIL = "support@beaconcapital.site";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getBaseHeader(): string {
  return `
    <div style="text-align: center; border-bottom: 2px solid ${BRAND_PRIMARY_COLOR}; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 24px; font-weight: 800; color: ${BRAND_PRIMARY_COLOR}; letter-spacing: 1.5px; font-family: 'Segoe UI', Arial, sans-serif;">
        ${BRAND_NAME}
      </div>
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
        Private & Commercial Banking
      </div>
    </div>
  `;
}

function getBaseFooter(): string {
  return `
    <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-family: sans-serif;">
      <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} ${BRAND_NAME} N.A. Member FDIC. Equal Housing Lender.</p>
      <p style="margin: 4px 0;">If you have any questions, contact our support team at <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ACCENT_COLOR}; text-decoration: none;">${SUPPORT_EMAIL}</a>.</p>
      <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">This message contains confidential financial communications intended strictly for the recipient.</p>
    </div>
  `;
}

function wrapLayout(contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .email-card { max-width: 600px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); }
          .item-table { width: 100%; margin: 20px 0; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #e2e8f0; gap: 12px; }
          .item-row:last-child { border-bottom: none; }
          .item-label { color: #64748b; font-size: 13.5px; font-weight: 500; flex-shrink: 0; max-width: 48%; }
          .item-value { text-align: right; color: #0f172a; font-size: 13.5px; font-weight: 500; word-break: break-word; overflow-wrap: break-word; max-width: 52%; }
          .highlight-val { color: ${BRAND_ACCENT_COLOR} !important; font-weight: 700 !important; }
          .bold-val { font-weight: 700 !important; }
          
          @media only screen and (max-width: 480px) {
            body { padding: 6px !important; }
            .email-card { padding: 20px 14px !important; border-radius: 10px !important; }
            .item-table { padding: 8px 12px !important; margin: 16px 0 !important; }
            .item-row { flex-direction: column !important; align-items: flex-start !important; gap: 3px !important; padding: 8px 0 !important; }
            .item-label { max-width: 100% !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: #94a3b8 !important; }
            .item-value { text-align: left !important; max-width: 100% !important; font-size: 13.5px !important; font-weight: 600 !important; width: 100% !important; }
            .header-brand { font-size: 20px !important; }
            .amount-display { font-size: 24px !important; margin: 14px 0 !important; }
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
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Welcome to ${BRAND_NAME}</h2>
    <p style="color: #334155; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Thank you for registering your account with ${BRAND_NAME}. Please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${verifyUrl}" style="background-color: ${BRAND_ACCENT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
    </div>

    <p style="color: #64748b; font-size: 13px;">Link valid for 24 hours. If you did not create an account, please ignore this email.</p>
  `);
}

// ----------------------------------------------------------------------
// 2. APPLICATION SUBMITTED EMAIL
// ----------------------------------------------------------------------
export function getApplicationSubmittedEmail(userName: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Application Under Review</h2>
    <p style="color: #334155; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Your account application has been received and is currently under review by our Bank Compliance team.</p>
    
    ${renderItemizedTable([
      { label: "Applicant Name", value: userName },
      { label: "Application Status", value: "Pending Review", isHighlight: true },
      { label: "Estimated Review Time", value: "1-2 Business Days" }
    ])}

    <p style="color: #334155; line-height: 1.6;">We will notify you via email as soon as your background verification is finalized.</p>
  `);
}

// ----------------------------------------------------------------------
// 3. APPLICATION APPROVED EMAIL
// ----------------------------------------------------------------------
export function getApplicationApprovedEmail(userName: string): string {
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 18px; margin: 0 0 8px 0;">Account Approved!</h2>
      <p style="color: #15803d; margin: 0; font-size: 14px;">Your background verification is complete and your account is active.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">We are pleased to inform you that your ${BRAND_NAME} account has been fully approved and activated. You can now log into your dashboard to deposit funds, manage transfers, and access your banking features.</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://beaconcapital.site'}/login" style="background-color: ${BRAND_PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">Access Client Portal</a>
    </div>
  `);
}

// ----------------------------------------------------------------------
// 4. APPLICATION REJECTED EMAIL
// ----------------------------------------------------------------------
export function getApplicationRejectedEmail(userName: string, reason: string): string {
  return wrapLayout(`
    <h2 style="color: #991b1b; font-size: 20px; margin-top: 0;">Application Status Update</h2>
    <p style="color: #334155; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Thank you for your interest in ${BRAND_NAME}. Following a review of your application by our compliance team, we regret to inform you that we are unable to open an account for you at this time.</p>
    
    ${renderItemizedTable([
      { label: "Applicant Name", value: userName },
      { label: "Decision", value: "Application Declined", isBold: true },
      { label: "Reason Specified", value: reason || "Compliance verification policy criteria not met" }
    ])}

    <p style="color: #64748b; font-size: 13px;">If you believe this decision was made in error, please contact our support team.</p>
  `);
}

// ----------------------------------------------------------------------
// 5. TRANSFER INITIATED (ACH / Wire / Zelle / Bill Pay) EMAIL
// ----------------------------------------------------------------------
export function getTransferInitiatedEmail(data: {
  userName: string;
  transferType: string; // 'Wire Transfer' | 'ACH Transfer' | 'Zelle Transfer' | 'Bill Payment'
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
    { label: "Sender Name", value: data.userName },
    { label: "Sending Account", value: `Checking (*${data.sendingAccountMask})` },
    { label: "Recipient / Beneficiary", value: data.recipientName },
  ];

  if (data.recipientDetails) {
    rows.push({ label: "Recipient Details", value: data.recipientDetails });
  }

  rows.push(
    { label: "Transfer Amount", value: formatCurrency(data.amount) },
    { label: "Service Fee", value: data.fee ? formatCurrency(data.fee) : "$0.00" },
    { label: "Total Amount Debited", value: formatCurrency(totalDebit), isBold: true },
    { label: "Reference Number", value: data.referenceNumber, isHighlight: true },
    { label: "Date & Time", value: data.date },
    { label: "Status", value: "Pending Compliance Review" }
  );

  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">${data.transferType} Submitted</h2>
    <p style="color: #334155; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Your <strong>${data.transferType}</strong> has been submitted successfully and is undergoing processing.</p>

    <div style="font-size: 28px; font-weight: 800; color: ${BRAND_PRIMARY_COLOR}; text-align: center; margin: 20px 0;">
      ${formatCurrency(totalDebit)}
    </div>

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
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 18px; margin: 0 0 8px 0;">Transfer Settled & Completed</h2>
      <p style="color: #15803d; margin: 0; font-size: 14px;">Funds have cleared compliance and been transferred.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
    
    ${renderItemizedTable([
      { label: "Transaction Type", value: data.transferType },
      { label: "Recipient", value: data.recipientName },
      { label: "Settled Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference Number", value: data.referenceNumber, isHighlight: true },
      { label: "Settlement Date", value: data.date },
      { label: "Status", value: "Settled / Cleared" }
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
    <h2 style="color: #991b1b; font-size: 20px; margin-top: 0;">Transfer Declined / Returned</h2>
    <p style="color: #334155; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Your <strong>${data.transferType}</strong> could not be completed and has been declined by compliance. Any pending funds held for this transaction have been returned to your account balance.</p>

    ${renderItemizedTable([
      { label: "Transaction Type", value: data.transferType },
      { label: "Amount Refunded", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference Number", value: data.referenceNumber },
      { label: "Reason", value: data.reason || "Declined during verification review" },
      { label: "Status", value: "Rejected & Returned" }
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
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Mobile Check Deposit Received</h2>
    <p style="color: #334155; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">We have received your mobile check deposit. It is currently under review by our check verification system.</p>

    <div style="font-size: 28px; font-weight: 800; color: ${BRAND_PRIMARY_COLOR}; text-align: center; margin: 20px 0;">
      ${formatCurrency(data.amount)}
    </div>

    ${renderItemizedTable([
      { label: "Account Holder", value: data.userName },
      { label: "Destination Account", value: `${data.targetAccountName} (*${data.targetAccountMask})` },
      { label: "Deposit Amount", value: formatCurrency(data.amount) },
      { label: "Capture Type", value: "Mobile Check Image Capture" },
      { label: "Reference Number", value: data.referenceNumber, isHighlight: true },
      { label: "Deposit Date & Time", value: data.date },
      { label: "Funds Availability", value: "Pending 1-Business-Day Verification Hold" }
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
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 18px; margin: 0 0 8px 0;">Check Deposit Cleared!</h2>
      <p style="color: #15803d; margin: 0; font-size: 14px;">Funds are now available in your account balance.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>

    ${renderItemizedTable([
      { label: "Account Destination", value: `Account (*${data.targetAccountMask})` },
      { label: "Cleared Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference Number", value: data.referenceNumber, isHighlight: true },
      { label: "Status", value: "Cleared & Funds Available" }
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
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Account Balance Adjustment Notice</h2>
    <p style="color: #334155; line-height: 1.6;">Dear <strong>${data.userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">A balance adjustment has been applied to your ${BRAND_NAME} account by Bank Compliance.</p>

    ${renderItemizedTable([
      { label: "Account", value: `Account (*${data.accountMask})` },
      { label: "Adjustment Type", value: isCredit ? "Credit (+)" : "Debit (-)" },
      { label: "Method / Description", value: data.method },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference Code", value: data.reference || "N/A" },
      { label: "Effective Date", value: data.date }
    ])}
  `);
}

// ----------------------------------------------------------------------
// 11. ACCOUNT FROZEN SECURITY ALERT EMAIL
// ----------------------------------------------------------------------
export function getAccountFrozenEmail(userName: string, reason: string): string {
  return wrapLayout(`
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #991b1b; font-size: 18px; margin: 0 0 8px 0;">SECURITY ALERT: Account Access Restricted</h2>
      <p style="color: #b91c1c; margin: 0; font-size: 14px;">Your account has been temporarily frozen by compliance.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">Please be advised that your ${BRAND_NAME} account has been placed on security hold. During this freeze, pending transactions are paused and outward transfers are blocked.</p>

    ${renderItemizedTable([
      { label: "Account Holder", value: userName },
      { label: "Restriction Reason", value: reason || "Compliance security check" },
      { label: "Action Required", value: "Contact Compliance Desk" }
    ])}

    <p style="color: #334155; line-height: 1.6;">To resolve this hold, please contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `);
}

// ----------------------------------------------------------------------
// 12. ACCOUNT UNFROZEN SECURITY NOTICE EMAIL
// ----------------------------------------------------------------------
export function getAccountUnfrozenEmail(userName: string): string {
  return wrapLayout(`
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #166534; font-size: 18px; margin: 0 0 8px 0;">Account Access Restored</h2>
      <p style="color: #15803d; margin: 0; font-size: 14px;">Security hold lifted.</p>
    </div>

    <p style="color: #334155; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">We are pleased to notify you that the security restriction on your ${BRAND_NAME} account has been lifted. Full banking functionality and online access are fully restored.</p>
  `);
}

// ----------------------------------------------------------------------
// 13. PASSWORD RESET EMAIL
// ----------------------------------------------------------------------
export function getPasswordResetEmail(userName: string, resetUrl: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #334155; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
    <p style="color: #334155; line-height: 1.6;">We received a request to reset your ${BRAND_NAME} account password. Click the link below to set a new password:</p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="background-color: ${BRAND_ACCENT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>

    <p style="color: #64748b; font-size: 13px;">If you did not request a password reset, please secure your account by contacting support immediately.</p>
  `);
}

// ----------------------------------------------------------------------
// 14. ADMIN NEW APPLICANT ALERT EMAIL
// ----------------------------------------------------------------------
export function getAdminNewApplicantEmail(applicantName: string, applicantEmail: string): string {
  return wrapLayout(`
    <h2 style="color: ${BRAND_PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">[COMPLIANCE ALERT] New Applicant Review</h2>
    <p style="color: #334155; line-height: 1.6;">A new user has completed onboarding and is pending review in the Admin Console.</p>

    ${renderItemizedTable([
      { label: "Applicant Name", value: applicantName },
      { label: "Applicant Email", value: applicantEmail },
      { label: "Queue Status", value: "Pending Compliance Verification", isHighlight: true }
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
    <div style="background-color: #fffbebf1; border: 1px solid #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #92400e; font-size: 18px; margin: 0 0 8px 0;">[COMPLIANCE ALERT] High-Value Transaction</h2>
      <p style="color: #b45309; margin: 0; font-size: 14px;">Transaction exceeds threshold ($10,000+).</p>
    </div>

    ${renderItemizedTable([
      { label: "Customer Name", value: data.userName },
      { label: "Transaction Type", value: data.transferType },
      { label: "Amount", value: formatCurrency(data.amount), isBold: true },
      { label: "Reference Number", value: data.referenceNumber, isHighlight: true }
    ])}
  `);
}
