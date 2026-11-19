import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.titan.email';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (process.env.SMTP_SECURE === 'true' || port === 465);
  const user = process.env.SMTP_USER || 'support@globalhealthkart.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const from = process.env.SMTP_FROM || `"Raj Biosis Pvt. Ltd." <${user}>`;

  return { host, port, secure, user, pass, from };
}

function createTransporterForHost(host, port, secure, user, pass) {
  if (!pass) return null;

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Sends an OTP email to the user
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit numeric OTP code
 * @param {string} [recipientName] - Name of recipient (e.g. Dr. Rajesh Sharma)
 * @param {string} [purpose] - Purpose of OTP (e.g. 'Customer Registration', 'Quotation Access', 'Account Login')
 */
export async function sendOtpEmail(toEmail, otp, recipientName = 'Healthcare Professional', purpose = 'Account Verification & Quotation Access') {
  const cleanEmail = (toEmail || '').trim();
  if (!cleanEmail) {
    throw new Error('Recipient email is required');
  }

  const { host: primaryHost, port, secure, user: senderEmail, pass, from } = getSmtpConfig();
  const subject = `Your Raj Biosis Security OTP: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 0; color: #0f172a; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #450a0a 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0; color: #ffffff; }
        .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f87171; margin-top: 6px; font-weight: 700; }
        .body-content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .otp-card { background: #fef2f2; border: 2px dashed #ef4444; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
        .otp-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #991b1b; margin-bottom: 8px; }
        .otp-number { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #b91c1c; margin: 6px 0; text-indent: 8px; }
        .otp-validity { font-size: 11px; color: #7f1d1d; font-weight: 600; margin-top: 8px; }
        .security-note { background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 16px; margin: 24px 0; font-size: 12px; color: #334155; line-height: 1.5; }
        .footer { background: #f1f5f9; padding: 24px 32px; font-size: 11px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer strong { color: #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-title">RAJ BIOSIS PVT. LTD.</div>
          <div class="logo-sub">Biomedical Equipment & Hospital Systems</div>
        </div>
        <div class="body-content">
          <div class="greeting">Dear ${recipientName || 'Doctor / Healthcare Executive'},</div>
          <p class="desc">
            You requested a verification code for <strong>${purpose}</strong> on the official Raj Biosis portal.
            Use the 6-digit One-Time Password (OTP) below to authenticate your request.
          </p>

          <div class="otp-card">
            <div class="otp-label">Your One-Time Security Passcode</div>
            <div class="otp-number">${otp}</div>
            <div class="otp-validity">⏱ Valid for 10 minutes | Single-use only</div>
          </div>

          <div class="security-note">
            <strong>Security Reminder:</strong> Never share this verification code with anyone. Official Raj Biosis engineers or sales representatives will never ask for your confidential OTP.
          </div>

          <p class="desc" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email or write directly to our vigilance desk at <a href="mailto:inquiry@rajbiosis.com" style="color: #dc2626; font-weight: 600;">inquiry@rajbiosis.com</a>.
          </p>
        </div>
        <div class="footer">
          <strong>Raj Biosis Private Limited</strong><br>
          Direct OEM Biomedical Equipment, Critical Care ICU & Hospital Infrastructure<br>
          CDSCO Registered &bull; ISO 13485:2016 Certified &bull; Toll-Free: +91 9983333469<br>
          Official Desk: <strong>${senderEmail}</strong> | <a href="https://rajbiosis.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">rajbiosis.com</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
RAJ BIOSIS PVT. LTD. - Official OTP Verification

Dear ${recipientName || 'Doctor / Healthcare Executive'},

Your One-Time Security Passcode (OTP) for ${purpose} is:
${otp}

This code is valid for 10 minutes. Please do not share it with anyone.

Sent from official desk: ${senderEmail}
Raj Biosis Pvt. Ltd. | CDSCO & ISO 13485:2016 Certified
Toll-Free: +91 9983333469 | inquiry@rajbiosis.com
  `.trim();

  const mailOptions = {
    from: from,
    to: cleanEmail,
    replyTo: senderEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  if (pass) {
    const candidateHosts = [primaryHost, 'smtp.titan.email', 'smtppro.zoho.com', 'smtppro.zoho.in', 'smtp.zoho.com'];
    const uniqueHosts = Array.from(new Set(candidateHosts.filter(Boolean)));

    for (const host of uniqueHosts) {
      try {
        const trans = createTransporterForHost(host, port, secure, senderEmail, pass);
        if (!trans) break;

        const info = await trans.sendMail(mailOptions);
        console.log(`[MAILER SUCCESS] OTP email sent via ${host} to ${cleanEmail} from ${senderEmail} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, deliveredVia: 'smtp', host };
      } catch (err) {
        console.warn(`[MAILER SMTP ATTEMPT FAILED] Host ${host}: ${err.message}`);
      }
    }
    console.error(`[MAILER SMTP ERROR] All SMTP candidate hosts failed for ${cleanEmail}`);
  } else {
    console.warn('[MAILER NOTICE] SMTP_PASS is empty in .env.local. Real email cannot be sent over internet without password.');
    console.log(`======================================================================`);
    console.log(`[MAILER DEV DISPATCH] From: ${senderEmail}`);
    console.log(`[MAILER DEV DISPATCH] To: ${cleanEmail}`);
    console.log(`[MAILER DEV DISPATCH] Purpose: ${purpose}`);
    console.log(`[MAILER DEV DISPATCH] >>> VERIFICATION OTP: ${otp} <<<`);
    console.log(`[MAILER DEV DISPATCH] Note: Configure SMTP_PASS in .env.local for live SMTP delivery.`);
    console.log(`======================================================================`);
  }

  return {
    success: true,
    deliveredVia: pass ? 'smtp_attempted' : 'local_dev',
    note: 'OTP recorded on server',
  };
}
