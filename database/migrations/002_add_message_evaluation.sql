-- Migration dijalankan satu kali
-- Menambahkan fitur evaluasi capaian pada pesan kapsul yang sudah terbuka
ALTER TABLE `messages`
ADD COLUMN `status_capaian` ENUM('belum_ditandai','tercapai','belum_tercapai') NOT NULL DEFAULT 'belum_ditandai' AFTER `tanggal_buka`,
ADD COLUMN `catatan_capaian` TEXT NULL AFTER `status_capaian`,
ADD COLUMN `tanggal_evaluasi` DATETIME NULL AFTER `catatan_capaian`;
