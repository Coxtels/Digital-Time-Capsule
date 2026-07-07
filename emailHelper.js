const nodemailer = require('nodemailer');

const createTransporter = () => {
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    requireTLS: smtpPort === 587,
    family: Number(process.env.SMTP_FAMILY || 4),
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

const sendVerificationEmail = async (email, nama_lengkap, verificationLink) => {
  try {
    const transporter = createTransporter();
    
    // Escape simple HTML characters for safety in HTML email
    const escapeHtml = (text) => {
      return String(text).replace(/[&<>"']/g, function(m) {
        switch (m) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#039;';
          default: return m;
        }
      });
    };
    
    const safeName = escapeHtml(nama_lengkap);

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'TimeCapsule'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verifikasi Email Anda - TimeCapsule',
      text: `Halo ${nama_lengkap},\n\nTerima kasih telah mendaftar di TimeCapsule. Silakan verifikasi email Anda dengan mengklik tautan berikut:\n${verificationLink}\n\nJika Anda tidak merasa mendaftar, abaikan email ini.\n\nSalam,\nTim TimeCapsule`,
      html: `<p>Halo <strong>${safeName}</strong>,</p>
             <p>Terima kasih telah mendaftar di <strong>TimeCapsule</strong>. Silakan verifikasi email Anda dengan mengklik tautan berikut:</p>
             <p><a href="${verificationLink}">Verifikasi Email</a></p>
             <br>
             <p>Jika tautan di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:<br>
             ${verificationLink}</p>
             <br><p>Salam,<br>Tim TimeCapsule</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verifikasi terkirim:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error saat mengirim email verifikasi:', error);
    throw error;
  }
};

const sendCapsuleCreatedEmail = async (email, nama_lengkap, judul_pesan, tanggal_buka) => {
  try {
    const transporter = createTransporter();
    
    // Format tanggal untuk bahasa Indonesia
    const date = new Date(tanggal_buka);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('id-ID', options);

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'TimeCapsule'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Kapsul Waktu Anda Berhasil Disimpan',
      text: `Halo ${nama_lengkap},\n\nKapsul waktu Anda dengan judul "${judul_pesan}" berhasil disimpan. Kapsul ini akan terbuka pada ${formattedDate}.\n\nSalam,\nTim TimeCapsule`,
      html: `<p>Halo <strong>${nama_lengkap}</strong>,</p><p>Kapsul waktu Anda dengan judul "<strong>${judul_pesan}</strong>" berhasil disimpan.</p><p>Kapsul ini akan terbuka pada <strong>${formattedDate}</strong>.</p><br><p>Salam,<br>Tim TimeCapsule</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email konfirmasi kapsul terkirim:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error saat mengirim email kapsul:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendCapsuleCreatedEmail
};
