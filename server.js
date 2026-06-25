require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const crypto = require('crypto');
const emailHelper = require('./emailHelper');

const app = express();
const port = 3000;

// 1. Middleware untuk membaca data dari request body (format JSON dan form-urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Menyajikan file HTML/CSS/JS statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 3. Konfigurasi koneksi database MySQL (Laragon / Docker via .env)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'timecapsule_db',
  port: process.env.DB_PORT || 3306
});

// Mengecek koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('Koneksi ke database gagal (Pastikan Laragon & MySQL menyala):', err.message);
  } else {
    console.log('Berhasil terhubung ke database timecapsule_db!');
  }
});

// ==========================================
// API ENDPOINTS (Rute-rute untuk Backend)
// ==========================================

// Endpoint 1: Register (Menyimpan data user baru)
app.post('/api/register', (req, res) => {
  let { nama_lengkap, email, password } = req.body;

  if (!nama_lengkap || !email || !password) {
    return res.status(400).json({ message: 'Nama lengkap, email, dan password wajib diisi!' });
  }

  email = email.trim().toLowerCase();

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar!' });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error('Transaction start error:', err);
        return res.status(500).json({ message: 'Gagal memulai transaksi' });
      }

      const insertUserQuery = 'INSERT INTO users (nama_lengkap, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [nama_lengkap, email, password], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Insert user error:', err);
            res.status(500).json({ message: 'Gagal melakukan registrasi' });
          });
        }

        const userId = result.insertId;
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        // Token expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const insertTokenQuery = 'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
        db.query(insertTokenQuery, [userId, tokenHash, expiresAt], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Insert token error:', err);
              res.status(500).json({ message: 'Gagal membuat token verifikasi' });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Commit error:', err);
                res.status(500).json({ message: 'Gagal menyelesaikan registrasi' });
              });
            }

            const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
            const verificationLink = `${baseUrl}/verify-email.html?token=${rawToken}`;
            
            emailHelper.sendVerificationEmail(email, nama_lengkap, verificationLink)
              .then(() => {
                res.status(201).json({ 
                  message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
                  requiresVerification: true,
                  emailSent: true
                });
              })
              .catch(errMail => {
                console.error('Gagal mengirim email verifikasi:', errMail);
                res.status(201).json({ 
                  message: 'Registrasi berhasil! Namun email verifikasi gagal dikirim.',
                  requiresVerification: true,
                  emailSent: false
                });
              });
          });
        });
      });
    });
  });
});

// Endpoint 1b: Verify Email
app.get('/api/verify-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token tidak diberikan' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ message: 'Gagal memulai transaksi' });
    }

    db.query('SELECT user_id, expires_at FROM email_verification_tokens WHERE token_hash = ?', [tokenHash], (err, results) => {
      if (err) {
        return db.rollback(() => {
          console.error('Select token error:', err);
          res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          res.status(400).json({ message: 'Token tidak valid atau tidak ditemukan' });
        });
      }

      const { user_id, expires_at } = results[0];

      if (new Date() > new Date(expires_at)) {
        db.query('DELETE FROM email_verification_tokens WHERE token_hash = ?', [tokenHash], () => {
          db.commit(() => {
            res.status(410).json({ message: 'Token kedaluwarsa' });
          });
        });
        return;
      }

      db.query('UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = ?', [user_id], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Update user error:', err);
            res.status(500).json({ message: 'Gagal verifikasi email' });
          });
        }

        db.query('DELETE FROM email_verification_tokens WHERE token_hash = ?', [tokenHash], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Delete token error:', err);
              res.status(500).json({ message: 'Gagal membersihkan token' });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Commit error:', err);
                res.status(500).json({ message: 'Gagal menyelesaikan verifikasi' });
              });
            }

            res.status(200).json({ message: 'Verifikasi email berhasil' });
          });
        });
      });
    });
  });
});

// Endpoint 1c: Resend Verification
app.post('/api/resend-verification', (req, res) => {
  let { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email wajib diisi' });
  }
  
  email = email.trim().toLowerCase();
  
  const genericResponse = () => res.status(200).json({ message: 'Jika akun terdaftar dan belum diverifikasi, email verifikasi akan dikirim.' });

  db.query('SELECT id, nama_lengkap, email_verified_at FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return genericResponse();
    }

    const user = results[0];
    if (user.email_verified_at) {
      return genericResponse(); // Already verified
    }

    db.query('SELECT created_at FROM email_verification_tokens WHERE user_id = ?', [user.id], (err, tokenResults) => {
      if (err) {
        return genericResponse(); // Suppress error
      }
      
      if (tokenResults.length > 0) {
        const createdAt = new Date(tokenResults[0].created_at);
        const timeDiffSeconds = (new Date() - createdAt) / 1000;
        if (timeDiffSeconds < 60) {
          return genericResponse(); // Cooldown not met
        }
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      db.query(
        'REPLACE INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt],
        (err) => {
          if (err) return genericResponse();
          
          const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
          const verificationLink = `${baseUrl}/verify-email.html?token=${rawToken}`;
          emailHelper.sendVerificationEmail(email, user.nama_lengkap, verificationLink).catch(() => {});
          
          return genericResponse();
        }
      );
    });
  });
});

// Endpoint 2: Login (Mengecek kecocokan email & password)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi!' });
  }

  const query = 'SELECT id, nama_lengkap, email, email_verified_at FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal melakukan proses login' });
    }

    if (results.length > 0) {
      const user = results[0];
      if (!user.email_verified_at) {
        return res.status(403).json({ 
          message: 'Email belum diverifikasi.',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }
      
      // Data ditemukan, artinya login sukses
      delete user.email_verified_at;
      res.status(200).json({ message: 'Login berhasil!', user: user });
    } else {
      // Data tidak ditemukan
      res.status(401).json({ message: 'Email atau password salah!' });
    }
  });
});

// Endpoint 3: Menyimpan pesan kapsul masa depan
app.post('/api/messages', (req, res) => {
  // Menggunakan kolom sesuai database: judul_pesan, isi_pesan, tanggal_buka
  const { user_id, judul_pesan, isi_pesan, tanggal_buka } = req.body;

  if (!user_id || !judul_pesan || !isi_pesan || !tanggal_buka) {
    return res.status(400).json({ message: 'Semua data (User ID, Judul, Isi, Tanggal) wajib diisi!' });
  }

  const query = 'INSERT INTO messages (user_id, judul_pesan, isi_pesan, tanggal_buka) VALUES (?, ?, ?, ?)';
  db.query(query, [user_id, judul_pesan, isi_pesan, tanggal_buka], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal menyimpan pesan kapsul' });
    }

    // Ambil data email user untuk mengirim email konfirmasi
    const userQuery = 'SELECT nama_lengkap, email FROM users WHERE id = ?';
    db.query(userQuery, [user_id], (errUser, resultUser) => {
      if (!errUser && resultUser.length > 0) {
        const user = resultUser[0];
        // Kirim email notifikasi (tidak memblokir response jika gagal)
        emailHelper.sendCapsuleCreatedEmail(user.email, user.nama_lengkap, judul_pesan, tanggal_buka).catch(errMail => {
          console.error('Gagal mengirim email konfirmasi kapsul:', errMail);
        });
      } else {
        console.error('Gagal mengambil data user untuk kirim email kapsul:', errUser);
      }
    });

    res.status(201).json({ message: 'Pesan kapsul waktu berhasil disimpan!' });
  });
});

// Endpoint 4: Mengambil semua pesan kapsul
app.get('/api/messages', (req, res) => {
  const userId = req.query.userId;
  let query = `
    SELECT m.*, u.nama_lengkap 
    FROM messages m 
    JOIN users u ON m.user_id = u.id 
  `;
  const params = [];
  
  if (userId) {
    query += ` WHERE m.user_id = ? `;
    params.push(userId);
  }
  
  query += ` ORDER BY m.id DESC `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal mengambil data pesan' });
    }
    res.status(200).json(results);
  });
});

// ==========================================
// MENJALANKAN SERVER
// ==========================================
app.listen(port, () => {
  console.log(`Server Backend berjalan di http://localhost:${port}`);
});
