import { Resend } from 'resend';

let cachedClient: { client: Resend; fromEmail: string } | null = null;

function getResendClient() {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set');
  }

  cachedClient = {
    client: new Resend(apiKey),
    fromEmail: process.env.RESEND_FROM_EMAIL || 'TrustHome <noreply@resend.dev>',
  };
  return cachedClient;
}

export async function getUncachableResendClient() {
  return getResendClient();
}

function buildEmailHtml(heading: string, body: string, code: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#1A8A7E;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">TrustHome</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#333333;font-size:20px;font-weight:600;">${heading}</h2>
              <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">${body}</p>
              <div style="background-color:#f8f9fa;border:2px solid #1A8A7E;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1A8A7E;">${code}</span>
              </div>
              <p style="margin:0;color:#999999;font-size:13px;line-height:1.5;">
                This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;color:#aaaaaa;font-size:12px;">&copy; ${new Date().getFullYear()} TrustHome. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendVerificationEmail(to: string, code: string) {
  const { client, fromEmail } = getResendClient();

  await client.emails.send({
    from: fromEmail,
    to,
    subject: 'TrustHome - Verify Your Email',
    html: buildEmailHtml(
      'Verify Your Email',
      'Enter the following verification code to complete your sign-in:',
      code,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const { client, fromEmail } = getResendClient();

  await client.emails.send({
    from: fromEmail,
    to,
    subject: 'TrustHome - Reset Your Password',
    html: buildEmailHtml(
      'Reset Your Password',
      'Enter the following code to reset your password. If you did not request a password reset, please ignore this email.',
      code,
    ),
  });
}
