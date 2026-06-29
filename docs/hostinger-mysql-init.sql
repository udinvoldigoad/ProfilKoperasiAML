-- Hostinger MySQL init schema for Koperasi Agro Mulyo Lestari
-- Run inside phpMyAdmin on database: u234110555_koperasiaml

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` CHAR(36) NOT NULL,
  `auth_user_id` CHAR(36) NULL,
  `role` ENUM('admin','anggota') NOT NULL DEFAULT 'anggota',
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(50) NULL,
  `password_hash` VARCHAR(255) NULL,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_auth_user_id_key` (`auth_user_id`),
  KEY `profiles_role_email_idx` (`role`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `members` (
  `id` CHAR(36) NOT NULL,
  `profile_id` CHAR(36) NULL,
  `member_number` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `nik` VARCHAR(16) NOT NULL,
  `birth_place` VARCHAR(191) NOT NULL,
  `birth_date` DATE NOT NULL,
  `address` TEXT NOT NULL,
  `photo_url` TEXT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(50) NULL,
  `status` ENUM('aktif','nonaktif','ditangguhkan') NOT NULL DEFAULT 'aktif',
  `member_type` ENUM('anggota_lama','anggota_baru') NOT NULL DEFAULT 'anggota_lama',
  `deleted_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_profile_id_key` (`profile_id`),
  UNIQUE KEY `members_nik_key` (`nik`),
  UNIQUE KEY `members_member_type_member_number_key` (`member_type`, `member_number`),
  KEY `members_status_member_type_idx` (`status`, `member_type`),
  KEY `members_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `members_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `date` DATE NOT NULL,
  `start_time` VARCHAR(5) NOT NULL,
  `end_time` VARCHAR(5) NOT NULL,
  `location` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('draft','aktif','selesai','dibatalkan') NOT NULL DEFAULT 'draft',
  `qr_token` VARCHAR(191) NULL,
  `qr_expires_at` DATETIME(3) NULL,
  `created_by` CHAR(36) NULL,
  `deleted_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_qr_token_key` (`qr_token`),
  KEY `events_status_date_idx` (`status`, `date`),
  KEY `events_deleted_at_idx` (`deleted_at`),
  KEY `events_created_by_idx` (`created_by`),
  CONSTRAINT `events_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendances` (
  `id` CHAR(36) NOT NULL,
  `event_id` CHAR(36) NOT NULL,
  `member_id` CHAR(36) NOT NULL,
  `attended_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `method` ENUM('qr_code','manual') NOT NULL DEFAULT 'qr_code',
  `user_agent` TEXT NULL,
  `ip_address` VARCHAR(100) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_event_id_member_id_key` (`event_id`, `member_id`),
  KEY `attendances_member_id_idx` (`member_id`),
  CONSTRAINT `attendances_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendances_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `announcements_pinned_date_idx` (`pinned`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `board_members` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `position` VARCHAR(191) NOT NULL,
  `photo_url` TEXT NULL,
  `contact` VARCHAR(50) NULL,
  `period` VARCHAR(100) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` TEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'aktif',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `thumbnail_url` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `author_id` CHAR(36) NULL,
  `status` ENUM('draft','publish') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_key` (`slug`),
  KEY `posts_status_published_at_idx` (`status`, `published_at`),
  KEY `posts_author_id_idx` (`author_id`),
  CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `image_url` TEXT NOT NULL,
  `description` TEXT NULL,
  `event_date` DATE NULL,
  `category` VARCHAR(100) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `units` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `contact` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'aktif',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` CHAR(36) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL,
  `actor_profile_id` CHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` CHAR(36) NULL,
  `summary` TEXT NOT NULL,
  `metadata` JSON NULL,
  `ip_address` VARCHAR(100) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_action_entity_type_idx` (`action`, `entity_type`),
  KEY `audit_logs_created_at_idx` (`created_at`),
  KEY `audit_logs_actor_profile_id_idx` (`actor_profile_id`),
  CONSTRAINT `audit_logs_actor_profile_id_fkey` FOREIGN KEY (`actor_profile_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;