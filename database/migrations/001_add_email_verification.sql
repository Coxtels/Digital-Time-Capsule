-- Migration dijalankan satu kali
-- Menambahkan email_verified_at ke tabel users
ALTER TABLE `users` 
ADD COLUMN `email_verified_at` DATETIME NULL;

-- Menandai seluruh akun yang sudah ada sebagai terverifikasi dengan waktu saat migration dijalankan
UPDATE `users`
SET `email_verified_at` = CURRENT_TIMESTAMP;

-- Membuat tabel email_verification_tokens
CREATE TABLE `email_verification_tokens` (
  `user_id` int NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
