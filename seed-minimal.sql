-- Open360 Minimal Seed Script
-- Only users, categories, and questions (NO cycles or assignments)
-- Run this in TablePlus

-- ============================================
-- Users Only
-- ============================================
-- Admin User
INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('Admin User', 'admin@company.com', '$2a$10$C3uoS65krNLMv9n05uQd6uK5KiLpqlI8TmMv1xlCb1wvAReWASDZa', 'ADMIN', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Get admin ID
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@company.com' LIMIT 1);

-- Employees (with manager relationships)
INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('John Employee', 'employee@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @admin_id, NOW(), NOW()),
('Jane Smith', 'jane@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @admin_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Get John Employee ID for Bob's manager
SET @john_id = (SELECT id FROM users WHERE email = 'employee@company.com' LIMIT 1);

INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('Bob Johnson', 'bob@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', @john_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- Categories
-- ============================================
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Leadership', 'Leadership and management capabilities', NOW(), NOW()),
('Communication', 'Communication skills and effectiveness', NOW(), NOW()),
('Teamwork', 'Collaboration and team working abilities', NOW(), NOW()),
('Problem Solving', 'Analytical thinking and problem-solving skills', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Get category IDs
SET @leadership_id = (SELECT id FROM categories WHERE name = 'Leadership' LIMIT 1);
SET @communication_id = (SELECT id FROM categories WHERE name = 'Communication' LIMIT 1);
SET @teamwork_id = (SELECT id FROM categories WHERE name = 'Teamwork' LIMIT 1);
SET @problem_solving_id = (SELECT id FROM categories WHERE name = 'Problem Solving' LIMIT 1);

-- ============================================
-- Questions
-- ============================================
-- Leadership Questions
INSERT IGNORE INTO questions (category_id, text, created_at, updated_at) VALUES
(@leadership_id, 'This person demonstrates strong leadership skills and inspires others to perform at their best.', NOW(), NOW()),
(@leadership_id, 'This person effectively delegates tasks and responsibilities to team members.', NOW(), NOW()),
(@leadership_id, 'This person provides clear direction and vision for the team.', NOW(), NOW()),
(@leadership_id, 'This person makes difficult decisions confidently and takes responsibility for outcomes.', NOW(), NOW()),
(@leadership_id, 'This person mentors and develops others to reach their potential.', NOW(), NOW());

-- Communication Questions
INSERT IGNORE INTO questions (category_id, text, created_at, updated_at) VALUES
(@communication_id, 'This person communicates clearly and effectively in both written and verbal forms.', NOW(), NOW()),
(@communication_id, 'This person actively listens to others and responds appropriately to feedback.', NOW(), NOW()),
(@communication_id, 'This person presents information in a clear, organized, and engaging manner.', NOW(), NOW()),
(@communication_id, 'This person adapts their communication style to different audiences and situations.', NOW(), NOW()),
(@communication_id, 'This person provides constructive feedback and handles difficult conversations well.', NOW(), NOW());

-- Teamwork Questions
INSERT IGNORE INTO questions (category_id, text, created_at, updated_at) VALUES
(@teamwork_id, 'This person collaborates well with team members and contributes positively to group dynamics.', NOW(), NOW()),
(@teamwork_id, 'This person supports and helps colleagues when needed.', NOW(), NOW()),
(@teamwork_id, 'This person shares knowledge and resources freely with team members.', NOW(), NOW()),
(@teamwork_id, 'This person resolves conflicts constructively and maintains positive relationships.', NOW(), NOW()),
(@teamwork_id, 'This person contributes to a positive and inclusive team environment.', NOW(), NOW());

-- Problem Solving Questions
INSERT IGNORE INTO questions (category_id, text, created_at, updated_at) VALUES
(@problem_solving_id, 'This person approaches problems with a systematic and analytical mindset.', NOW(), NOW()),
(@problem_solving_id, 'This person finds creative and effective solutions to complex challenges.', NOW(), NOW()),
(@problem_solving_id, 'This person gathers relevant information before making decisions.', NOW(), NOW()),
(@problem_solving_id, 'This person considers multiple perspectives and alternatives when solving problems.', NOW(), NOW()),
(@problem_solving_id, 'This person learns from mistakes and applies lessons to future situations.', NOW(), NOW());


