# ***Untuk Arch Linux***  
# **Digital Time Capsule**  
Ini adalah project web **Digital Time Capsule**.  
 Project ini memakai **Node.js** untuk backend dan  **MySQL** sebagai database.  
Panduan ini aku tulis berdasarkan setup di laptopku, yaitu **Arch Linux** dengan  **Docker** untuk menjalankan MySQL.  
## **1. Menyalakan Database MySQL**  
Sebelum menjalankan web, database MySQL harus dinyalakan dulu.  
 Karena MySQL di project ini berjalan lewat Docker, container-nya bisa saja mati setelah laptop dimatikan atau restart.  
Pertama, pastikan service Docker sudah aktif:  
sudo systemctl start docker  
   
Kalau Docker sudah pernah di-enable, biasanya langkah ini tidak perlu dilakukan lagi:  
sudo systemctl enable docker  
   
Setelah itu, nyalakan container MySQL yang dipakai untuk project ini:  
docker start timecapsule-mysql  
   
Kalau tidak ada error, berarti database sudah aktif dan siap dipakai.  
## **2. Menjalankan Server Backend**  
Setelah database menyala, langkah berikutnya adalah menjalankan server backend.  
Masuk dulu ke folder project:  
cd ~/Projects/Tugas-Kelompok-Web  
   
Lalu jalankan server dengan Node.js:  
node server.js  
   
Kalau berhasil, nanti akan muncul kurang lebih seperti ini:  
Server Backend berjalan di http://localhost:3000  
Berhasil terhubung ke database timecapsule_db!  
   
Terminal yang menjalankan node server.js jangan ditutup.  
 Kalau terminal ditutup atau menekan Ctrl + C, server akan berhenti dan web tidak bisa diakses.  
## **3. Membuka Web**  
Untuk membuka web, jangan langsung klik file .html dari file manager.  
Buka browser seperti Chrome, Firefox, atau Brave, lalu akses:  
http://localhost:3000  
   
Dari halaman itu, web sudah bisa digunakan untuk login, membuat pesan, dan fitur lainnya.  
## **4. Kalau Mengedit Tampilan atau CSS**  
Kalau ingin mengubah tampilan, misalnya warna tombol, ukuran teks, atau class Tailwind di file HTML, perubahan CSS tidak selalu langsung muncul otomatis.  
Setelah mengedit tampilan, buka terminal baru.  
 Biarkan terminal yang menjalankan node server.js tetap aktif.  
Masuk lagi ke folder project:  
cd ~/Projects/Tugas-Kelompok-Web  
   
Lalu jalankan build Tailwind:  
npm run build  
   
Setelah itu refresh halaman web di browser.  
 Tampilan yang baru seharusnya sudah muncul.  
## **5. Konfigurasi Environment (.env)**  
Project ini menggunakan file `.env` untuk mengatur konfigurasi database dan email (menggunakan Gmail SMTP).  
1. Copy file `.env.example` menjadi `.env` di folder utama.  
2. Konfigurasi Database (Kompatibel dengan Laragon dan Docker):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=timecapsule_db
   APP_BASE_URL=http://localhost:3000
   ```
   *(Ubah nilai-nilai ini jika menggunakan Docker atau konfigurasi custom).*
3. Setup Email:
   - Isi `GMAIL_USER` dengan alamat email Gmail Anda.  
   - Buat **App Password** di akun Google Anda dan isikan di `GMAIL_APP_PASSWORD`.  
   - Isi `MAIL_FROM_NAME` dengan nama pengirim (misal: TimeCapsule).

## **6. API Endpoints (Verifikasi Email)**
- `POST /api/register`: Membuat akun dan mengirim email verifikasi (mengembalikan `requiresVerification: true`).
- `GET /api/verify-email?token=...`: Memverifikasi email dengan token yang dikirim.
- `POST /api/resend-verification`: Mengirim ulang email verifikasi dengan cooldown 60 detik.
- `POST /api/login`: Membutuhkan akun terverifikasi. Jika belum, akan mengembalikan 403 `EMAIL_NOT_VERIFIED`.

## **Catatan**  
Panduan ini bisa dipakai kalau ingin menjalankan project dari awal, terutama kalau database atau server belum aktif.
