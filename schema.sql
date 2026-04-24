-- ═══════════════════════════════════════════════
-- ARCANUM — Rare Books Digital Archive
-- MySQL Database Schema
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS arcanum_books
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE arcanum_books;

-- ─── USERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_spent DECIMAL(12,2) DEFAULT 0.00,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ─── ADMINS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── CATEGORIES ─────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  icon_emoji VARCHAR(10) DEFAULT '📖'
) ENGINE=InnoDB;

-- ─── BOOKS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(300) NOT NULL,
  category_id INT NOT NULL,
  description TEXT,
  cover_image_path VARCHAR(500) DEFAULT NULL,
  pdf_path VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preview_pages INT DEFAULT 3,
  language VARCHAR(100) DEFAULT 'English',
  year_published INT DEFAULT NULL,
  origin_region VARCHAR(200) DEFAULT NULL,
  rarity_level ENUM('Rare','Extremely Rare','Ultra Rare') DEFAULT 'Rare',
  stock_type ENUM('digital') DEFAULT 'digital',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_rarity (rarity_level),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ─── ORDERS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255) DEFAULT NULL,
  payment_gateway VARCHAR(50) DEFAULT 'razorpay',
  status ENUM('pending','completed','failed') DEFAULT 'pending',
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_date (purchased_at)
) ENGINE=InnoDB;

-- ─── USER LIBRARY ───────────────────────────
CREATE TABLE IF NOT EXISTS user_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book (user_id, book_id),
  INDEX idx_user_lib (user_id)
) ENGINE=InnoDB;
