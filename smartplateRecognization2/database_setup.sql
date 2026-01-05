-- Create Database
CREATE DATABASE IF NOT EXISTS smartlpd;
USE smartlpd;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('CITIZEN', 'AUTHORITY') NOT NULL DEFAULT 'CITIZEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Detection History Table
CREATE TABLE IF NOT EXISTS detection_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate_number VARCHAR(20),
    image_path VARCHAR(500),
    detection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence DOUBLE,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    description TEXT,
    violation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    status ENUM('UNPAID', 'PAID', 'CANCELLED', 'APPEALED') DEFAULT 'UNPAID',
    issued_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create Indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX idx_detection_history_license_plate ON detection_history(license_plate_number);
CREATE INDEX idx_fines_license_plate ON fines(license_plate_number);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_issued_by ON fines(issued_by);

-- Insert Sample Data (Optional)
INSERT INTO users (username, email, password, full_name, role) VALUES
('testuser', 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV9UiC', 'Test User', 'CITIZEN'),
('testauthority', 'authority@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV9UiC', 'Test Authority', 'AUTHORITY');

-- Insert Sample Fines (Optional)
INSERT INTO fines (license_plate_number, amount, violation_type, description, violation_date, due_date, status, issued_by) VALUES
('ABC123', 100.00, 'SPEEDING', 'Exceeded speed limit by 20 km/h', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'UNPAID', 2),
('XYZ789', 50.00, 'RED_LIGHT', 'Ran red light at intersection', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 30 DAY, 'PAID', 2),
('DEF456', 75.00, 'NO_PARKING', 'Parked in no parking zone', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 30 DAY, 'UNPAID', 2);

-- Show created tables
SHOW TABLES;

-- Describe tables structure
DESCRIBE users;
DESCRIBE detection_history;
DESCRIBE fines;