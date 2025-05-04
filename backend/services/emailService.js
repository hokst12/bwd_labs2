const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

module.exports = {
  sendSecurityAlert: async (email, userAgent, ip) => {
    try {
      const info = await transporter.sendMail({
        from: '"Security Service" <security@yourdomain.com>',
        to: email,
        subject: '⚠ New Device or ip Login Detected',
        text: `
          New login detected:
          IP: ${ip}
          Device: ${userAgent}
          Time: ${new Date().toLocaleString()}
        `,
        html: `
          <h2>New login detected</h2>
          <p><strong>IP:</strong> ${ip}</p>
          <p><strong>Device:</strong> ${userAgent}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If this wasn't you, please secure your account immediately.</p>
        `
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Mailtrap error:', error);
      return false;
    }
  }
};