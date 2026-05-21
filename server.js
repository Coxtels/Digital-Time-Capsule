const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// 1. Middleware untuk membaca data dari request body (format JSON dan form-urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Menyajikan file HTML/CSS/JS statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 3. Konfigurasi koneksi database MySQL (Laragon)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Password default Laragon kosong
  database: 'timecapsule_db'
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
  // Menggunakan nama_lengkap sesuai kolom di database
  const { nama_lengkap, email, password } = req.body;

  if (!nama_lengkap || !email || !password) {
    return res.status(400).json({ message: 'Nama lengkap, email, dan password wajib diisi!' });
  }

  const query = 'INSERT INTO users (nama_lengkap, email, password) VALUES (?, ?, ?)';
  db.query(query, [nama_lengkap, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal melakukan registrasi' });
    }
    res.status(201).json({ message: 'Registrasi berhasil!' });
  });
});

// Endpoint 2: Login (Mengecek kecocokan email & password)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi!' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal melakukan proses login' });
    }

    if (results.length > 0) {
      // Data ditemukan, artinya login sukses
      res.status(200).json({ message: 'Login berhasil!', user: results[0] });
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
    res.status(201).json({ message: 'Pesan kapsul waktu berhasil disimpan!' });
  });
});

// ==========================================
// MENJALANKAN SERVER
// ==========================================
app.listen(port, () => {
  console.log(`Server Backend berjalan di http://localhost:${port}`);
});
