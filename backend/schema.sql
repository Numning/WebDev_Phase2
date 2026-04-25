-- Game Store Database Schema (8 Tables)
CREATE DATABASE IF NOT EXISTS game_store;
USE game_store;

-- ============================================
-- Table 1: Administrator
-- ============================================
CREATE TABLE IF NOT EXISTS Administrator (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Age INT,
    Address VARCHAR(255),
    Email VARCHAR(150) UNIQUE NOT NULL
);

-- ============================================
-- Table 2: AdminLogin
-- ============================================
CREATE TABLE IF NOT EXISTS AdminLogin (
    LoginID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Manager',
    LastLoginLog DATETIME,
    FOREIGN KEY (AdminID) REFERENCES Administrator(AdminID) ON DELETE CASCADE
);

-- ============================================
-- Table 3: Game (Product)
-- ============================================
CREATE TABLE IF NOT EXISTS Game (
    GameID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    PricingType ENUM('Regular', 'Sale', 'Free') DEFAULT 'Regular',
    SalePercent INT DEFAULT 0,
    Description TEXT,
    ReleaseDate DATE,
    ImageUrl VARCHAR(500),
    GalleryImages TEXT
);

-- ============================================
-- Table 4: Genre
-- ============================================
CREATE TABLE IF NOT EXISTS Genre (
    GenreID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================
-- Table 5: GameGenre (Junction — many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS GameGenre (
    GameGenreID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    GenreID INT NOT NULL,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    FOREIGN KEY (GenreID) REFERENCES Genre(GenreID) ON DELETE CASCADE,
    UNIQUE KEY unique_game_genre (GameID, GenreID)
);

-- ============================================
-- Table 6: Review
-- ============================================
CREATE TABLE IF NOT EXISTS Review (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    ReviewerName VARCHAR(100) NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE
);

-- ============================================
-- Table 7: Wishlist
-- ============================================
CREATE TABLE IF NOT EXISTS Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    SessionID VARCHAR(100) NOT NULL,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (GameID, SessionID)
);

-- ============================================
-- Table 8: AdminAddGame
-- ============================================
CREATE TABLE IF NOT EXISTS AdminAddGame (
    AddID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    GameID INT NOT NULL,
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES Administrator(AdminID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE KEY unique_admin_game (AdminID, GameID)
);

-- ============================================
-- Seed Data (admin only — games are imported from GameStock.csv by initDb.js)
-- ============================================

-- Admin user (password: admin123 — bcrypt hash)
INSERT INTO Administrator (FirstName, LastName, Age, Address, Email) VALUES
('Admin', 'User', 30, '123 Admin Street', 'admin@gamestore.com');

INSERT INTO AdminLogin (AdminID, Username, Password, Role, LastLoginLog) VALUES
(1, 'admin', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'SuperAdmin', NOW());
