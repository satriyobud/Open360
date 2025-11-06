-- Open360 Database Seed Script
-- Run this in TablePlus or your MySQL client

-- Note: Password hashes are bcrypt hashed
-- Admin password: admin123
-- Employee password: employee123

-- Insert Users
INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) VALUES
('Admin User', 'admin@company.com', '$2a$10$C3uoS65krNLMv9n05uQd6uK5KiLpqlI8TmMv1xlCb1wvAReWASDZa', 'ADMIN', NULL, NOW(), NOW()),
('John Employee', 'employee@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', 1, NOW(), NOW()),
('Jane Smith', 'jane@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', 1, NOW(), NOW()),
('Bob Johnson', 'bob@company.com', '$2a$10$WCXJGCamkN94gJ/gvQRJMuz9B71XF5uLAUtNSkYv8zI/may887Gzi', 'EMPLOYEE', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Insert Review Cycle
INSERT INTO review_cycles (id, name, start_date, end_date, status, assignment_config, created_at, updated_at) VALUES
(1, 'Q4 2024 Performance Review', '2024-10-01', '2024-12-31', 'active', '{"self":true,"manager":true,"subordinate":true,"peer":true}', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Insert Categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Leadership', 'Leadership and management capabilities', NOW(), NOW()),
('Communication', 'Communication skills and effectiveness', NOW(), NOW()),
('Teamwork', 'Collaboration and team working abilities', NOW(), NOW()),
('Problem Solving', 'Analytical thinking and problem-solving skills', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Insert Questions (assuming categories get IDs 1-4)
-- Leadership Questions (Category ID: 1)
INSERT INTO questions (category_id, text, created_at, updated_at) VALUES
(1, 'This person demonstrates strong leadership skills and inspires others to perform at their best.', NOW(), NOW()),
(1, 'This person effectively delegates tasks and responsibilities to team members.', NOW(), NOW()),
(1, 'This person provides clear direction and vision for the team.', NOW(), NOW()),
(1, 'This person makes difficult decisions confidently and takes responsibility for outcomes.', NOW(), NOW()),
(1, 'This person mentors and develops others to reach their potential.', NOW(), NOW()),

-- Communication Questions (Category ID: 2)
(2, 'This person communicates clearly and effectively in both written and verbal forms.', NOW(), NOW()),
(2, 'This person actively listens to others and responds appropriately to feedback.', NOW(), NOW()),
(2, 'This person presents information in a clear, organized, and engaging manner.', NOW(), NOW()),
(2, 'This person adapts their communication style to different audiences and situations.', NOW(), NOW()),
(2, 'This person provides constructive feedback and handles difficult conversations well.', NOW(), NOW()),

-- Teamwork Questions (Category ID: 3)
(3, 'This person collaborates well with team members and contributes positively to group dynamics.', NOW(), NOW()),
(3, 'This person supports and helps colleagues when needed.', NOW(), NOW()),
(3, 'This person shares knowledge and resources freely with team members.', NOW(), NOW()),
(3, 'This person resolves conflicts constructively and maintains positive relationships.', NOW(), NOW()),
(3, 'This person contributes to a positive and inclusive team environment.', NOW(), NOW()),

-- Problem Solving Questions (Category ID: 4)
(4, 'This person approaches problems with a systematic and analytical mindset.', NOW(), NOW()),
(4, 'This person finds creative and effective solutions to complex challenges.', NOW(), NOW()),
(4, 'This person gathers relevant information before making decisions.', NOW(), NOW()),
(4, 'This person considers multiple perspectives and alternatives when solving problems.', NOW(), NOW()),
(4, 'This person learns from mistakes and applies lessons to future situations.', NOW(), NOW());

-- Insert Review Assignments
-- Note: Adjust user IDs based on actual IDs from users table
-- Assuming: Admin=1, John Employee=2, Jane Smith=3, Bob Johnson=4

INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) VALUES
-- John Employee (ID: 2) assignments
(1, 2, 2, 'SELF', NOW(), NOW()),
(1, 1, 2, 'MANAGER', NOW(), NOW()),
(1, 3, 2, 'PEER', NOW(), NOW()),
(1, 4, 2, 'SUBORDINATE', NOW(), NOW()),

-- Jane Smith (ID: 3) assignments
(1, 3, 3, 'SELF', NOW(), NOW()),
(1, 1, 3, 'MANAGER', NOW(), NOW()),
(1, 2, 3, 'PEER', NOW(), NOW()),
(1, 4, 3, 'PEER', NOW(), NOW())
ON DUPLICATE KEY UPDATE review_cycle_id=review_cycle_id;


