# 🚀 Panduan Lengkap Menjalankan Web "Time Capsule"

Panduan ini dibuat khusus untukmu agar kamu tidak bingung jika baru menyalakan laptop dan ingin melanjutkan *coding* atau mempresentasikan tugas ini ke dosen.

Ikuti langkah-langkah di bawah ini secara berurutan.

---

## Tahap 1: Menyalakan Database (MySQL)
Web ini membutuhkan *database* untuk menyimpan data user dan pesan. Karena kamu memakai Docker di Arch Linux, *container* MySQL kamu mungkin mati saat laptop dimatikan.

1. Buka Terminal.
2. Pastikan service Docker menyala:
   ```bash
   sudo systemctl start docker
   ```
   *(Tips: Jika kamu sudah mengaktifkan `sudo systemctl enable docker`, langkah ini bisa dilewati).*
3. Nyalakan *container* MySQL yang sudah kita buat sebelumnya:
   ```bash
   docker start timecapsule-mysql
   ```
4. Selesai! Brankas database-mu sudah aktif di belakang layar (port 3306).

---

## Tahap 2: Menyalakan Server (Backend)
Setelah database menyala, kita harus menyalakan "Resepsionis" yang menjembatani HTML dengan Database.

1. Buka Terminal (atau belah terminalmu jika menggunakan *tiling window manager* seperti Hyprland).
2. Masuk ke folder proyekmu:
   ```bash
   cd ~/Projects/Tugas-Kelompok-Web
   ```
3. Jalankan server dengan Node.js:
   ```bash
   node server.js
   ```
4. Jika berhasil, kamu akan melihat tulisan:
   > Server Backend berjalan di http://localhost:3000
   > Berhasil terhubung ke database timecapsule_db!

**Penting:** Biarkan terminal ini tetap terbuka selama kamu membuka webnya. Jika terminal ditutup (atau kamu menekan `Ctrl+C`), web akan mati.

---

## Tahap 3: Mengakses Web
Jangan pernah membuka file `.html` secara langsung (klik 2x di file manager). Selalu gunakan alamat *localhost*.

1. Buka *Web Browser* favoritmu (Chrome/Firefox/Brave).
2. Ketik alamat ini di URL bar:
   👉 **`http://localhost:3000`**
3. Halaman utama (index) akan terbuka dan kamu sudah bisa *Login*, membuat pesan, dll.

---

## 🛠️ Kondisi Khusus: Bagaimana Jika Ingin Mengedit Tampilan (CSS)?
Jika kamu sedang iseng ingin mengubah warna tombol, ukuran huruf, atau menambahkan *class* Tailwind baru di file HTML, perubahan warna itu **TIDAK AKAN MUNCUL** secara otomatis.

Kamu harus menyuruh Tailwind untuk meracik ulang kode CSS-mu:

1. Buka Terminal baru (biarkan terminal `node server.js` tetap hidup).
2. Masuk ke folder proyekmu:
   ```bash
   cd ~/Projects/Tugas-Kelompok-Web
   ```
3. Jalankan perintah *build* Tailwind:
   ```bash
   npm run build
   ```
4. *Refresh* halaman web-mu. Desain barunya akan langsung muncul!

---

**Selamat Ber-Koding Ria! 💻✨**
*(Simpan panduan ini, kamu juga bisa membagikan panduan ini kepada kelompokmu jika mereka bingung)*
