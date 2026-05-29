const nodemailer = require('nodemailer');

let transporter;
let useStreamTransport = false;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    useStreamTransport = true;
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return transporter;
}

async function trySendRealMail(to, resetUrl) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: `"Via-Trip" <${process.env.EMAIL_USER || 'noreply@viatrip.com'}>`,
    to,
    subject: 'Your Via-Trip Password Reset Link',
    text: [
      'You have requested a password reset for your Via-Trip account.',
      '',
      `Reset your password using this link: ${resetUrl}`,
      '',
      'This link expires in 1 hour.',
      '',
      'If you did not request this, please ignore this email.',
      '',
      '— Via-Trip Team',
    ].join('\n'),
    html: [
      '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">',
      '<h2 style="color:#1e3a5f;">Via-Trip Password Reset</h2>',
      '<p>You have requested a password reset for your Via-Trip account.</p>',
      '<p style="margin:24px 0;">',
      `<a href="${resetUrl}" `,
      'style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">',
      'Reset Your Password</a></p>',
      '<p>Or copy this link into your browser:</p>',
      `<p style="font-size:12px;color:#666;word-break:break-all;">${resetUrl}</p>`,
      '<p>This link expires in <strong>1 hour</strong>.</p>',
      '<p style="font-size:13px;color:#888;margin-top:32px;">If you did not request this, please ignore this email.</p>',
      '<p style="font-size:13px;color:#888;">— Via-Trip Team</p>',
      '</div>',
    ].join(''),
  });
  console.log('Password reset email sent to:', to, '(id:', info.messageId, ')');
}

function logDevEmail(to, resetUrl) {
  console.log('\n=== Password Reset Email (DEV MODE) ===');
  console.log('To:', to);
  console.log('Reset URL:', resetUrl);
  console.log('=== End Email ===\n');
}

async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  if (useStreamTransport) {
    logDevEmail(to, resetUrl);
    return;
  }

  try {
    await trySendRealMail(to, resetUrl);
  } catch (err) {
    console.error('Gmail SMTP failed, falling back to dev log:', err.message);
    logDevEmail(to, resetUrl);
  }
}

module.exports = { sendPasswordResetEmail };
