import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(to, otp) {
  const from = process.env.SMTP_FROM || `Grace Academy <${process.env.SMTP_USER}>`
  const transporter = createTransport()

  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your Google account — Grace Academy',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1b22;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1b22;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#10222b;border:1px solid rgba(201,147,44,.22);border-radius:16px;overflow:hidden">

        <tr>
          <td style="background:linear-gradient(135deg,#071318 0%,#0d1e28 100%);padding:28px 40px 20px;border-bottom:1px solid rgba(201,147,44,.12);text-align:center">
            <div style="font-size:12px;font-weight:700;letter-spacing:.24em;color:#c9932c;margin-bottom:4px">GRACE ACADEMY</div>
            <div style="font-size:9px;letter-spacing:.18em;color:rgba(201,147,44,.45)">ASSESSOR PORTAL</div>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 0;text-align:center">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:rgba(66,133,244,.1);border:1.5px solid rgba(66,133,244,.25);margin-bottom:20px">
              <svg width="32" height="32" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <div style="display:inline-block;background:rgba(201,147,44,.1);border:1px solid rgba(201,147,44,.28);border-radius:100px;padding:5px 16px;margin-bottom:16px">
              <span style="font-size:10px;font-weight:700;letter-spacing:.16em;color:#c9932c">GOOGLE ACCOUNT VERIFICATION</span>
            </div>
            <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#ffffff;line-height:1.3">Verify your Google account</h1>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,.42);line-height:1.65;max-width:380px;display:inline-block">
              Use the code below to verify <strong style="color:rgba(255,255,255,.65)">${to}</strong> and link it to your assessor profile.<br>
              This code expires in <strong style="color:#c9932c">3 minutes</strong>.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 40px">
            <div style="background:rgba(201,147,44,.07);border:1.5px dashed rgba(201,147,44,.35);border-radius:14px;padding:30px 24px;text-align:center">
              <div style="font-size:10px;font-weight:700;letter-spacing:.2em;color:rgba(201,147,44,.55);margin-bottom:16px;text-transform:uppercase">Your Verification Code</div>
              <div style="font-size:40px;font-weight:900;letter-spacing:10px;color:#c9932c;font-family:'Courier New',Courier,monospace;padding-left:10px">${otp}</div>
              <div style="margin-top:14px;font-size:11px;color:rgba(255,255,255,.25);letter-spacing:.06em">⏱ Valid for 3 minutes · Single use only</div>
            </div>
          </td>
        </tr>

        <tr><td style="padding:0 40px"><div style="height:1px;background:linear-gradient(to right,transparent,rgba(201,147,44,.18),transparent)"></div></td></tr>

        <tr>
          <td style="padding:24px 40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="32" valign="top" style="padding-top:2px">
                <div style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);text-align:center;line-height:28px;font-size:13px">⚠️</div>
              </td>
              <td style="padding-left:12px">
                <p style="margin:0;font-size:12px;color:rgba(255,255,255,.32);line-height:1.75">
                  <strong style="color:rgba(255,255,255,.5)">Security Notice:</strong>
                  Never share this code with anyone. If you didn't request this, you can safely ignore this email.
                </p>
              </td>
            </tr></table>
          </td>
        </tr>

        <tr>
          <td style="padding:18px 40px 24px;border-top:1px solid rgba(255,255,255,.05);text-align:center">
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,.18);letter-spacing:.06em">© 2025 GRACE ACADEMY · ALL RIGHTS RESERVED</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendOtpEmail(to, otp) {
  const from = process.env.SMTP_FROM || `Grace Academy <${process.env.SMTP_USER}>`
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000'
  const illustrationUrl = `${baseUrl}/images/reset-mail-illustration.svg`
  const transporter = createTransport()

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Grace Academy Password Reset Code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1b22;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1b22;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#10222b;border:1px solid rgba(201,147,44,.22);border-radius:16px;overflow:hidden">

        <!-- Header / Brand -->
        <tr>
          <td style="background:linear-gradient(135deg,#071318 0%,#0d1e28 100%);padding:28px 40px 20px;border-bottom:1px solid rgba(201,147,44,.12);text-align:center">
            <div style="font-size:12px;font-weight:700;letter-spacing:.24em;color:#c9932c;margin-bottom:4px">GRACE ACADEMY</div>
            <div style="font-size:9px;letter-spacing:.18em;color:rgba(201,147,44,.45)">LONG LIVE LEARN</div>
          </td>
        </tr>

        <!-- Illustration -->
        <tr>
          <td style="background:linear-gradient(180deg,#0d1e28 0%,#10222b 100%);padding:32px 40px 0;text-align:center">
            <img src="${illustrationUrl}" alt="Password Reset" width="260" height="195"
              style="width:260px;max-width:100%;height:auto;display:inline-block" />
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:28px 40px 0;text-align:center">
            <div style="display:inline-block;background:rgba(201,147,44,.1);border:1px solid rgba(201,147,44,.28);border-radius:100px;padding:5px 16px;margin-bottom:16px">
              <span style="font-size:10px;font-weight:700;letter-spacing:.16em;color:#c9932c">ACCOUNT RECOVERY</span>
            </div>
            <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#ffffff;line-height:1.2">Your one-time reset code</h1>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,.42);line-height:1.65;max-width:380px;display:inline-block">
              Use the code below to reset your Grace Academy password.<br>
              This code expires in <strong style="color:#c9932c">3 minutes</strong>.
            </p>
          </td>
        </tr>

        <!-- OTP Box -->
        <tr>
          <td style="padding:28px 40px">
            <div style="background:rgba(201,147,44,.07);border:1.5px dashed rgba(201,147,44,.35);border-radius:14px;padding:30px 24px;text-align:center">
              <div style="font-size:10px;font-weight:700;letter-spacing:.2em;color:rgba(201,147,44,.55);margin-bottom:16px;text-transform:uppercase">Your One-Time Code</div>
              <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:#c9932c;font-family:'Courier New',Courier,monospace;padding-left:14px">${otp}</div>
              <div style="margin-top:14px;font-size:11px;color:rgba(255,255,255,.25);letter-spacing:.06em">⏱ Valid for 3 minutes · Single use only</div>
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px">
            <div style="height:1px;background:linear-gradient(to right,transparent,rgba(201,147,44,.18),transparent)"></div>
          </td>
        </tr>

        <!-- Security Notice -->
        <tr>
          <td style="padding:24px 40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32" valign="top" style="padding-top:2px">
                  <div style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);text-align:center;line-height:28px;font-size:13px">⚠️</div>
                </td>
                <td style="padding-left:12px">
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,.32);line-height:1.75">
                    <strong style="color:rgba(255,255,255,.5)">Security Notice:</strong>
                    Never share this code with anyone. Grace Academy will <em>never</em> ask for your OTP via phone or chat.
                    If you didn't request this reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 40px 24px;border-top:1px solid rgba(255,255,255,.05);text-align:center">
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,.18);letter-spacing:.06em">© 2025 GRACE ACADEMY · ALL RIGHTS RESERVED</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
