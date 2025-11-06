📦 Exporting data from local database...

-- Departments
INSERT INTO departments (id, name, created_at, updated_at) VALUES
(1, 'Executive', '2025-11-03 15:07:33.000', '2025-11-03 15:07:33.000'),
(2, 'Engineering', '2025-11-03 15:07:33.000', '2025-11-03 15:07:33.000'),
(3, 'Design', '2025-11-03 15:07:33.000', '2025-11-03 17:07:29.000');


-- Users
INSERT INTO users (id, name, email, password_hash, role, manager_id, department_id, created_at, updated_at) VALUES
(1, 'Admin User', 'admin@company.com', '$2a$10$JlJRMXc1ylGmJ.u0us3pNufsYVyO0Sqwb3lP3bZ8z6gBvLhQbw/Q6', 'ADMIN', NULL, NULL, '2025-11-03 04:32:59.770', '2025-11-03 04:32:59.770'),
(5, 'Alice Johnson', 'alice@example.com', '$2a$10$3EM9r7rT71uCumOkvieYZuj1tnmfOdKJF86Hc0GOaCOPFaQoKT6sW', 'EMPLOYEE', NULL, 1, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(6, 'Bob Smith', 'bob@example.com', '$2a$10$Ox9NegTjhUIF/Ph2/f1BkOzWqoYza0y8Y03XJxHEVBo5Irf8lmZi6', 'EMPLOYEE', 5, 2, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(7, 'Carol Lee', 'carol@example.com', '$2a$10$.WFTM.vst9So05j5Hr9xau3bfEZRvxcXsZK4uLXTHFD00ZajtFCLe', 'EMPLOYEE', 5, 3, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(8, 'David Kim', 'david@example.com', '$2a$10$Qw7ZqA7vRkfaHUw9KsjmzehhQEwhMqraQTi.objTpgh9oS27LZl4q', 'EMPLOYEE', 6, 2, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(9, 'Eve Tan', 'eve@example.com', '$2a$10$clfcQLtJ2j0D6Zv1RwFc1eIzHXp6wPjdSeJ0Q/Nf5rzAX3KFnwSJG', 'EMPLOYEE', 6, 2, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(10, 'Frank Zhao', 'frank@example.com', '$2a$10$9h3a4dFCc4SITHHQ.ktl1eJkpsid8C9GDLuwmKZPT67tnaILvWNqa', 'EMPLOYEE', 7, 3, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000'),
(11, 'Grace Liu', 'grace@example.com', '$2a$10$L1QVJKyYtYQ6j8MBMg7OlOmeX3.19qckb1RYb0wV75QsvNoqMVtGK', 'EMPLOYEE', 7, 3, '2025-11-03 15:07:34.000', '2025-11-03 15:07:34.000');


-- Categories
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
(1, 'Communication', 'Communication skills and effectiveness', '2025-11-03 04:32:59.948', '2025-11-03 04:32:59.948'),
(2, 'Teamwork', 'Collaboration and team working abilities', '2025-11-03 04:32:59.948', '2025-11-03 04:32:59.948'),
(3, 'Leadership', 'Leadership and management capabilities', '2025-11-03 04:32:59.948', '2025-11-03 04:32:59.948'),
(4, 'Problem Solving', 'Analytical thinking and problem-solving skills', '2025-11-03 04:32:59.949', '2025-11-03 04:32:59.949');


-- Questions
INSERT INTO questions (id, category_id, text, created_at, updated_at) VALUES
(1, 3, 'This person demonstrates strong leadership skills and inspires others to perform at their best.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(2, 1, 'This person communicates clearly and effectively in both written and verbal forms.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(3, 2, 'This person collaborates well with team members and contributes positively to group dynamics.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(4, 1, 'This person adapts their communication style to different audiences and situations.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(5, 3, 'This person provides clear direction and vision for the team.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(6, 3, 'This person effectively delegates tasks and responsibilities to team members.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(7, 3, 'This person makes difficult decisions confidently and takes responsibility for outcomes.', '2025-11-03 04:32:59.974', '2025-11-03 04:32:59.974'),
(8, 3, 'This person mentors and develops others to reach their potential.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(9, 2, 'This person resolves conflicts constructively and maintains positive relationships.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(10, 2, 'This person contributes to a positive and inclusive team environment.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(11, 1, 'This person provides constructive feedback and handles difficult conversations well.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(12, 4, 'This person approaches problems with a systematic and analytical mindset.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(13, 4, 'This person considers multiple perspectives and alternatives when solving problems.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(14, 4, 'This person learns from mistakes and applies lessons to future situations.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(15, 2, 'This person supports and helps colleagues when needed.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(16, 4, 'This person finds creative and effective solutions to complex challenges.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(17, 4, 'This person gathers relevant information before making decisions.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(18, 1, 'This person actively listens to others and responds appropriately to feedback.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(19, 2, 'This person shares knowledge and resources freely with team members.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975'),
(20, 1, 'This person presents information in a clear, organized, and engaging manner.', '2025-11-03 04:32:59.975', '2025-11-03 04:32:59.975');


✅ Export complete!

Note: Copy the output above and save it as a SQL file.
