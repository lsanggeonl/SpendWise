-- ========================================================
-- SpendWise Database Schema
-- Database: spendwise_db
-- ========================================================

-- Ensure database exists with utf8mb4 charset
CREATE DATABASE IF NOT EXISTS `spendwise_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `spendwise_db`;

-- Drop tables in reverse dependency order if rebuilding
DROP TABLE IF EXISTS `saving_goals`;
DROP TABLE IF EXISTS `analysis_reports`;
DROP TABLE IF EXISTS `budgets`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------
-- Table: users
-- Purpose: User authentication, profile & personal thresholds
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `monthly_income_target` DECIMAL(12,2) NOT NULL DEFAULT 3500000.00,
  `overspending_threshold` DECIMAL(12,2) NOT NULL DEFAULT 100000.00 COMMENT '단일 지출 과소비 기준금액',
  `micro_tx_threshold` DECIMAL(12,2) NOT NULL DEFAULT 10000.00 COMMENT '반복 소액 결제 기준금액',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: categories
-- Purpose: Classification of income and expense items
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL COMMENT 'NULL=공통 시스템 카테고리, 숫자=개인 커스텀 카테고리',
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'tag',
  `color` VARCHAR(20) NOT NULL DEFAULT '#6366F1',
  `is_system` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_categories_user_type` (`user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: transactions
-- Purpose: Ledger for income and expense transactions
-- --------------------------------------------------------
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `transaction_date` DATE NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT '신용카드',
  `is_fixed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=고정비/고정수입, 0=변동비',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_transactions_user_date` (`user_id`, `transaction_date`),
  INDEX `idx_transactions_user_cat` (`user_id`, `category_id`),
  INDEX `idx_transactions_user_type_date` (`user_id`, `type`, `transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: budgets
-- Purpose: Monthly overall and category-specific budget limits
-- --------------------------------------------------------
CREATE TABLE `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NULL COMMENT 'NULL=해당 월 전체 총예산, 숫자=특정 카테고리 예산',
  `year_month` VARCHAR(7) NOT NULL COMMENT '형식: YYYY-MM',
  `amount` DECIMAL(12,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_budgets_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_budget_user_cat_month` (`user_id`, `category_id`, `year_month`),
  INDEX `idx_budgets_user_month` (`user_id`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: analysis_reports
-- Purpose: Cached monthly habit diagnosis, score and metrics
-- --------------------------------------------------------
CREATE TABLE `analysis_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `year_month` VARCHAR(7) NOT NULL COMMENT '형식: YYYY-MM',
  `habit_score` INT NOT NULL DEFAULT 0 COMMENT '100점 만점 소비습관 점수',
  `grade` VARCHAR(20) NOT NULL DEFAULT '보통' COMMENT '최우수, 우수, 양호, 주의, 위험',
  `total_income` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_expense` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `net_savings` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `expected_month_end_expense` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '월말 예상 지출액',
  `budget_usage_rate` DECIMAL(6,2) NOT NULL DEFAULT 0.00 COMMENT '예산 소진율 (%)',
  `overspending_count` INT NOT NULL DEFAULT 0 COMMENT '과소비 건수',
  `overspending_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '과소비 총액',
  `micro_transaction_count` INT NOT NULL DEFAULT 0 COMMENT '반복 소액결제 건수',
  `micro_transaction_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '반복 소액결제 총액',
  `score_breakdown` JSON NULL COMMENT '세부 점수 및 평가 근거 JSON',
  `feedback_summary` TEXT NULL COMMENT '종합 분석 진단 피드백',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_analysis_user_month` (`user_id`, `year_month`),
  INDEX `idx_analysis_user_month` (`user_id`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: saving_goals
-- Purpose: Financial challenges and saving target management
-- --------------------------------------------------------
CREATE TABLE `saving_goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `target_amount` DECIMAL(12,2) NOT NULL,
  `current_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT '일반 저축',
  `status` ENUM('ongoing', 'completed', 'failed') NOT NULL DEFAULT 'ongoing',
  `icon` VARCHAR(50) NOT NULL DEFAULT 'target',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_saving_goals_user_status` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
