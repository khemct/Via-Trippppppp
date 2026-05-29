const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  const info = await transporter.sendMail({
    from: '"Via-Trip" <noreply@viatrip.com>',
    to,
    subject: 'Via-Trip Password Reset',
    text: [
      'You have requested a password reset for your Via-Trip account.',
      '',
      `Reset your password using this link: ${resetUrl}`,
      '',
      'This link expires in 1 hour.',
      '',
      'If you did not request this, please ignore this email.',
    ].join('\n'),
    html: [
      '<p>You have requested a password reset for your Via-Trip account.</p>',
      `<p>Reset your password using this link: <a href="${resetUrl}">${resetUrl}</a></p>`,
      '<p>This link expires in <strong>1 hour</strong>.</p>',
      '<p>If you did not request this, please ignore this email.</p>',
    ].join(''),
  });

  console.log('\n=== Password Reset Email (DEV MODE) ===');
  console.log('To:', to);
  console.log('Subject:', info.subject);
  console.log('Reset URL:', resetUrl);
  console.log('Raw message:\n' + info.message.toString());
  console.log('=== End Email ===\n');
}

module.exports = { sendPasswordResetEmail };
