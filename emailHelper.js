const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const net = require('net');

const resolveSmtpConnectionTargets = async (smtpHost) => {
  if (process.env.SMTP_FORCE_IPV4 === 'false' || net.isIP(smtpHost)) {
    return [{
      host: smtpHost,
      servername: net.isIP(smtpHost) ? process.env.SMTP_SERVERNAME || 'smtp.gmail.com' : smtpHost
    }];
  }

  const addresses = await dns.resolve4(smtpHost);

  if (!addresses.length) {
    throw new Error(`Tidak menemukan alamat IPv4 untuk SMTP host ${smtpHost}`);
  }

  return addresses.map((address) => ({
    host: address,
    servername: smtpHost
  }));
};

const createTransporter = (connectionTarget) => {
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: connectionTarget.host,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    requireTLS: smtpPort === 587,
    servername: connectionTarget.servername,
    tls: {
      servername: connectionTarget.servername
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

const isRetryableSmtpConnectionError = (error) => {
  return ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ENETUNREACH', 'ECONNREFUSED'].includes(error.code);
};

const sendMail = async (mailOptions, label) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const targets = await resolveSmtpConnectionTargets(smtpHost);
  let lastError;

  for (const target of targets) {
    try {
      const transporter = createTransporter(target);
      console.log(`Mencoba mengirim ${label} via SMTP ${target.servername} (${target.host})`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`${label} terkirim:`, info.messageId);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`${label} gagal via ${target.host}:`, {
        code: error.code,
        command: error.command,
        message: error.message
      });

      if (!isRetryableSmtpConnectionError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const sendVerificationEmail = async (email, nama_lengkap, verificationLink) => {
  try {
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

    return await sendMail(mailOptions, 'Email verifikasi');
  } catch (error) {
    console.error('Error saat mengirim email verifikasi:', error);
    throw error;
  }
};

const sendCapsuleCreatedEmail = async (email, nama_lengkap, judul_pesan, tanggal_buka) => {
  try {
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

    return await sendMail(mailOptions, 'Email konfirmasi kapsul');
  } catch (error) {
    console.error('Error saat mengirim email kapsul:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendCapsuleCreatedEmail
};
