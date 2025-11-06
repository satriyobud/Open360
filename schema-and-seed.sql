-- Open360 Complete Database Setup
-- This file includes both schema creation and seed data
-- Run this in TablePlus to set up everything at once

-- ============================================
-- PART 1: CREATE TABLES
-- ============================================

-- Table: departments (create first, referenced by users)
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `manager_id` INT NULL,
  `department_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_manager` (`manager_id`),
  INDEX `idx_department` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: review_cycles
CREATE TABLE IF NOT EXISTS `review_cycles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('active', 'completed', 'draft') NOT NULL DEFAULT 'draft',
  `assignment_config` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: questions
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `text` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: review_assignments
CREATE TABLE IF NOT EXISTS `review_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `review_cycle_id` INT NOT NULL,
  `reviewer_id` INT NOT NULL,
  `reviewee_id` INT NOT NULL,
  `relation_type` ENUM('SELF', 'MANAGER', 'PEER', 'SUBORDINATE') NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`review_cycle_id`) REFERENCES `review_cycles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_assignment` (`review_cycle_id`, `reviewer_id`, `reviewee_id`, `relation_type`),
  INDEX `idx_cycle` (`review_cycle_id`),
  INDEX `idx_reviewer` (`reviewer_id`),
  INDEX `idx_reviewee` (`reviewee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: feedbacks
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `review_assignment_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `score` INT NOT NULL CHECK (`score` >= 1 AND `score` <= 5),
  `comment` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`review_assignment_id`) REFERENCES `review_assignments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_feedback` (`review_assignment_id`, `question_id`),
  INDEX `idx_assignment` (`review_assignment_id`),
  INDEX `idx_question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 2: INSERT SEED DATA
-- ============================================

-- Insert Users
INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('Admin User', 'admin@company.com', '$2a$10$C3uoS65krNLMv9n05uQd6uK5KiLpqlI8TmMv1xlCb1wvAReWASDZa', 'ADMIN', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

SET @admin_id = (SELECT id FROM users WHERE email = 'admin@company.com' LIMIT 1);

INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('John Employee', 'employee@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @admin_id, NOW(), NOW()),
('Jane Smith', 'jane@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @admin_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

SET @john_id = (SELECT id FROM users WHERE email = 'employee@company.com' LIMIT 1);

INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('Bob Johnson', 'bob@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @john_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Insert Review Cycle
INSERT INTO review_cycles (name, start_date, end_date, status, assignment_config, created_at, updated_at) VALUES
('Q4 2024 Performance Review', '2024-10-01', '2024-12-31', 'active', '{"self":true,"manager":true,"subordinate":true,"peer":true}', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

SET @cycle_id = (SELECT id FROM review_cycles WHERE name = 'Q4 2024 Performance Review' LIMIT 1);

-- Insert Categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Leadership', 'Leadership and management capabilities', NOW(), NOW()),
('Communication', 'Communication skills and effectiveness', NOW(), NOW()),
('Teamwork', 'Collaboration and team working abilities', NOW(), NOW()),
('Problem Solving', 'Analytical thinking and problem-solving skills', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

SET @leadership_id = (SELECT id FROM categories WHERE name = 'Leadership' LIMIT 1);
SET @communication_id = (SELECT id FROM categories WHERE name = 'Communication' LIMIT 1);
SET @teamwork_id = (SELECT id FROM categories WHERE name = 'Teamwork' LIMIT 1);
SET @problem_solving_id = (SELECT id FROM categories WHERE name = 'Problem Solving' LIMIT 1);

-- Insert Questions
INSERT IGNORE INTO questions (category_id, text, created_at, updated_at) VALUES
(@leadership_id, 'This person demonstrates strong leadership skills and inspires others to perform at their best.', NOW(), NOW()),
(@leadership_id, 'This person effectively delegates tasks and responsibilities to team members.', NOW(), NOW()),
(@leadership_id, 'This person provides clear direction and vision for the team.', NOW(), NOW()),
(@leadership_id, 'This person makes difficult decisions confidently and takes responsibility for outcomes.', NOW(), NOW()),
(@leadership_id, 'This person mentors and develops others to reach their potential.', NOW(), NOW()),

(@communication_id, 'This person communicates clearly and effectively in both written and verbal forms.', NOW(), NOW()),
(@communication_id, 'This person actively listens to others and responds appropriately to feedback.', NOW(), NOW()),
(@communication_id, 'This person presents information in a clear, organized, and engaging manner.', NOW(), NOW()),
(@communication_id, 'This person adapts their communication style to different audiences and situations.', NOW(), NOW()),
(@communication_id, 'This person provides constructive feedback and handles difficult conversations well.', NOW(), NOW()),

(@teamwork_id, 'This person collaborates well with team members and contributes positively to group dynamics.', NOW(), NOW()),
(@teamwork_id, 'This person supports and helps colleagues when needed.', NOW(), NOW()),
(@teamwork_id, 'This person shares knowledge and resources freely with team members.', NOW(), NOW()),
(@teamwork_id, 'This person resolves conflicts constructively and maintains positive relationships.', NOW(), NOW()),
(@teamwork_id, 'This person contributes to a positive and inclusive team environment.', NOW(), NOW()),

(@problem_solving_id, 'This person approaches problems with a systematic and analytical mindset.', NOW(), NOW()),
(@problem_solving_id, 'This person finds creative and effective solutions to complex challenges.', NOW(), NOW()),
(@problem_solving_id, 'This person gathers relevant information before making decisions.', NOW(), NOW()),
(@problem_solving_id, 'This person considers multiple perspectives and alternatives when solving problems.', NOW(), NOW()),
(@problem_solving_id, 'This person learns from mistakes and applies lessons to future situations.', NOW(), NOW());

-- Insert Review Assignments
SET @jane_id = (SELECT id FROM users WHERE email = 'jane@company.com' LIMIT 1);
SET @bob_id = (SELECT id FROM users WHERE email = 'bob@company.com' LIMIT 1);

INSERT IGNORE INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) VALUES
(@cycle_id, @john_id, @john_id, 'SELF', NOW(), NOW()),
(@cycle_id, @admin_id, @john_id, 'MANAGER', NOW(), NOW()),
(@cycle_id, @jane_id, @john_id, 'PEER', NOW(), NOW()),
(@cycle_id, @bob_id, @john_id, 'SUBORDINATE', NOW(), NOW()),

(@cycle_id, @jane_id, @jane_id, 'SELF', NOW(), NOW()),
(@cycle_id, @admin_id, @jane_id, 'MANAGER', NOW(), NOW()),
(@cycle_id, @john_id, @jane_id, 'PEER', NOW(), NOW()),
(@cycle_id, @bob_id, @jane_id, 'PEER', NOW(), NOW());


