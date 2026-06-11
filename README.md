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
## **Catatan**  
Panduan ini bisa dipakai kalau ingin menjalankan project dari awal, terutama kalau database atau server belum aktif.  
   
