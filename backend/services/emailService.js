const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true, // 
  auth: {
    user: process.env.MAILRU_EMAIL, 
    pass: process.env.MAILRU_PASSWORD 
  }
});

module.exports = {
  sendSecurityAlert: async (email, userAgent, ip) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.MAILRU_EMAIL,
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