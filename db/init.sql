-- HMS v2 — database bootstrap
-- Hibernate `ddl-auto: update` creates all the tables on first service startup,
-- so we only need to ensure the database itself exists.
--
-- Run once, manually:
--   mysql -u root -psystem < db/init.sql

CREATE DATABASE IF NOT EXISTS hms_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Optional: dedicated app user (skip for local dev, root works fine)
-- CREATE USER IF NOT EXISTS 'hms'@'%' IDENTIFIED BY 'hms_password';
-- GRANT ALL PRIVILEGES ON hms_db.* TO 'hms'@'%';
-- FLUSH PRIVILEGES;

USE hms_db;
SELECT 'hms_db ready' AS status;
