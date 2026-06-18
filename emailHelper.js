const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

const sendRegistrationEmail = async (email, nama_lengkap) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'TimeCapsule'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Selamat Datang di TimeCapsule!',
      text: `Halo ${nama_lengkap},\n\nTerima kasih telah mendaftar di TimeCapsule. Akun Anda berhasil dibuat!\n\nSalam,\nTim TimeCapsule`,
      html: `<p>Halo <strong>${nama_lengkap}</strong>,</p><p>Terima kasih telah mendaftar di <strong>TimeCapsule</strong>. Akun Anda berhasil dibuat!</p><br><p>Salam,<br>Tim TimeCapsule</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email registrasi terkirim:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error saat mengirim email registrasi:', error);
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
  sendRegistrationEmail,
  sendCapsuleCreatedEmail
};
