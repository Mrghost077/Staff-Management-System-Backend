import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using Google SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS,
    },

    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false 
    }
  });

  // 2. Define email options
  const mailOptions = {
    from: `"TeachGrid System" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;