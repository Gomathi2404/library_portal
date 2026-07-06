-- Create database if not exists
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Create members table
CREATE TABLE IF NOT EXISTS `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roll_no` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `year` VARCHAR(50) NOT NULL,
  `member_type` VARCHAR(50) DEFAULT 'student',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE IF NOT EXISTS `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(100),
  `isbn` VARCHAR(20) UNIQUE,
  `total_copies` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create issued_books table
CREATE TABLE IF NOT EXISTS `issued_books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE,
  `return_date` DATE,
  `status` VARCHAR(20) DEFAULT 'issued',
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  INDEX (`member_id`),
  INDEX (`status`)
);

-- Create admin table
CREATE TABLE IF NOT EXISTS `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default super admin
INSERT IGNORE INTO `admin` (`username`, `password`, `department`) VALUES ('admin', 'admin123', 'admin');
