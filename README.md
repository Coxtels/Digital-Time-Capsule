# Digital Time Capsule

Digital Time Capsule adalah aplikasi web untuk membuat pesan pribadi yang disimpan sebagai kapsul waktu digital. Pesan hanya dapat dibaca setelah tanggal buka yang ditentukan pengguna.

Project ini dibuat sebagai aplikasi full-stack sederhana dengan backend Node.js, database MySQL, dan frontend static berbasis HTML, Tailwind CSS, serta JavaScript.

## Fitur Utama

- Registrasi dan login pengguna.
- Verifikasi email sebelum akun dapat digunakan.
- Kirim ulang email verifikasi jika akun belum aktif.
- Membuat pesan kapsul waktu dengan tanggal buka.
- Menampilkan pesan terkunci sebelum tanggal buka.
- Menampilkan isi pesan setelah tanggal buka tercapai.
- Menandai harapan pada pesan terbuka sebagai tercapai atau belum tercapai.
- Notifikasi email saat akun dibuat dan saat kapsul berhasil disimpan.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Email:** Nodemailer dengan Gmail SMTP, Mailjet API, atau Resend API
- **Frontend:** HTML, Vanilla JavaScript, Tailwind CSS
- **Package Manager:** npm

## Struktur Project

```text
.
├── database/
│   ├── migrations/
│   │   ├── 001_add_email_verification.sql
│   │   └── 002_add_message_evaluation.sql
│   └── timecapsule_db.sql
├── public/
│   ├── create.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── verify-email.html
│   └── output.css
├── src/
│   └── input.css
├── .env.example
├── emailHelper.js
├── package.json
├── server.js
└── tailwind.config.js
```

## Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js
- npm
- MySQL
- Akun Gmail untuk SMTP lokal atau akun provider email transactional seperti Mailjet/Resend untuk deployment

MySQL dapat dijalankan melalui Laragon, XAMPP, Docker, atau instalasi MySQL lokal lain selama konfigurasi `.env` sesuai.

## Instalasi

Clone repository:

```bash
git clone <url-repository>
cd Tugas-Kelompok-Web
```

Install dependency:

```bash
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

## Konfigurasi Environment

Isi file `.env` sesuai environment lokal atau server deploy:

```env
GMAIL_USER=email_pengirim@gmail.com
GMAIL_APP_PASSWORD=app_password_gmail
MAIL_FROM_NAME=TimeCapsule
EMAIL_PROVIDER=smtp

# Jika deploy di Railway dan SMTP diblokir, gunakan Mailjet API
MAILJET_API_KEY=
MAILJET_API_SECRET=
MAILJET_SENDER_EMAIL=
MAILJET_SENDER_NAME=TimeCapsule

# Alternatif provider email transactional via Resend API
RESEND_API_KEY=
RESEND_SENDER_EMAIL=
RESEND_SENDER_NAME=TimeCapsule

APP_BASE_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=timecapsule_db
```

Keterangan:

- `GMAIL_USER` adalah email sistem yang mengirim notifikasi.
- `GMAIL_APP_PASSWORD` adalah Google App Password, bukan password login Gmail biasa.
- `EMAIL_PROVIDER=smtp` menggunakan Gmail SMTP. Untuk Railway, gunakan provider API seperti `EMAIL_PROVIDER=mailjet` atau `EMAIL_PROVIDER=resend`.
- `MAILJET_*` digunakan saat email dikirim lewat Mailjet API.
- `RESEND_*` digunakan saat email dikirim lewat Resend API.
- `APP_BASE_URL` digunakan untuk membuat link verifikasi email.
- `DB_*` digunakan untuk koneksi backend ke MySQL.

Jangan commit file `.env` karena berisi credential.

## Setup Database

Buat database MySQL:

```sql
CREATE DATABASE timecapsule_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

Import schema awal:

```bash
mysql -u root -p timecapsule_db < database/timecapsule_db.sql
```

Jika database sudah ada sebelum fitur verifikasi email dan evaluasi pesan ditambahkan, jalankan migration berikut satu kali secara berurutan:

```bash
mysql -u root -p timecapsule_db < database/migrations/001_add_email_verification.sql
mysql -u root -p timecapsule_db < database/migrations/002_add_message_evaluation.sql
```

Untuk environment tanpa password MySQL, hilangkan opsi `-p`.

## Menjalankan Aplikasi

Jalankan server:

```bash
node server.js
```

Jika berhasil, terminal akan menampilkan:

```text
Server Backend berjalan di http://localhost:3000
Berhasil terhubung ke database timecapsule_db!
```

Buka aplikasi melalui browser:

```text
http://localhost:3000
```

Jangan membuka file HTML langsung dari file manager karena aplikasi membutuhkan backend Express untuk menjalankan API.

## Build CSS

Project menggunakan Tailwind CSS. Jika ada perubahan class Tailwind pada file HTML, build ulang CSS:

```bash
npm run build
```

Untuk mode watch saat development:

```bash
npm run watch
```

## Alur Verifikasi Email

1. Pengguna melakukan registrasi.
2. Backend membuat token verifikasi dan menyimpannya dalam bentuk hash.
3. Backend mengirim link verifikasi ke email pengguna.
4. Pengguna membuka link verifikasi.
5. Backend menandai akun sebagai verified.
6. Pengguna baru dapat login setelah email terverifikasi.

Token verifikasi berlaku selama 24 jam. Jika token kedaluwarsa atau email tidak diterima, pengguna dapat meminta pengiriman ulang dari halaman login.

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/api/register` | Membuat akun dan mengirim email verifikasi. |
| `POST` | `/api/login` | Login pengguna. Akun harus sudah verified. |
| `GET` | `/api/verify-email?token=...` | Memverifikasi email pengguna. |
| `POST` | `/api/resend-verification` | Mengirim ulang email verifikasi. |

### Messages

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/api/messages` | Membuat kapsul waktu baru. |
| `GET` | `/api/messages?userId=...` | Mengambil daftar kapsul waktu milik pengguna. |
| `PATCH` | `/api/messages/:id/evaluation` | Menyimpan status capaian dan catatan evaluasi pesan yang sudah terbuka. |

## Contoh Response Penting

Jika login ditolak karena email belum diverifikasi:

```json
{
  "message": "Email belum diverifikasi.",
  "code": "EMAIL_NOT_VERIFIED"
}
```

Jika registrasi berhasil dan email verifikasi dikirim:

```json
{
  "message": "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
  "requiresVerification": true,
  "emailSent": true
}
```

## Catatan Development

- File `.env` tidak boleh di-commit.
- File `node_modules/` tidak boleh di-commit.
- Jalankan `npm run build` setelah mengubah class Tailwind.
- Pastikan database sudah menjalankan schema dan migration terbaru sebelum testing fitur register/login.
- Untuk production, pastikan menggunakan credential yang aman, konfigurasi deployment yang sesuai, dan proteksi tambahan seperti hashing password.

## Lisensi

Project ini dibuat untuk kebutuhan pembelajaran dan tugas kelompok.
