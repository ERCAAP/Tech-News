import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL/TLS için
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Debug modunu açalım
});

// Bağlantıyı test edelim
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP Server Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

export async function sendVerificationEmail(to: string, code: string) {
  try {
    console.log('Sending email with config:', {
      from: process.env.EMAIL_USER,
      to: to,
      auth: {
        user: process.env.EMAIL_USER,
        // Şifreyi log'lamıyoruz
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Email Doğrulama Kodu',
      html: `
        <h1>Email Doğrulama</h1>
        <p>Doğrulama kodunuz: <strong>${code}</strong></p>
        <p>Bu kod 10 dakika süreyle geçerlidir.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('SMTP Server Error:', error);
    throw error;
  }
} 