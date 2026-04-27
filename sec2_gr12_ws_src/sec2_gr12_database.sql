-- ============================================
-- GameHub Database Schema + Seed Data
-- All tables and data for the GameHub application
-- ============================================

CREATE DATABASE IF NOT EXISTS game_store;
USE game_store;

-- Table 1: Administrator
CREATE TABLE IF NOT EXISTS Administrator (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Age INT,
    Address VARCHAR(255),
    Email VARCHAR(150) UNIQUE NOT NULL
);

-- Table 2: AdminLogin
CREATE TABLE IF NOT EXISTS AdminLogin (
    LoginID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Manager',
    LastLoginLog DATETIME,
    FOREIGN KEY (AdminID) REFERENCES Administrator(AdminID) ON DELETE CASCADE
);

-- Table 3: Game
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

-- Table 4: Genre
CREATE TABLE IF NOT EXISTS Genre (
    GenreID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) UNIQUE NOT NULL
);

-- Table 5: GameGenre (many-to-many junction)
CREATE TABLE IF NOT EXISTS GameGenre (
    GameGenreID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    GenreID INT NOT NULL,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    FOREIGN KEY (GenreID) REFERENCES Genre(GenreID) ON DELETE CASCADE,
    UNIQUE KEY unique_game_genre (GameID, GenreID)
);

-- Table 6: Review
CREATE TABLE IF NOT EXISTS Review (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    ReviewerName VARCHAR(100) NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE
);

-- Table 7: Wishlist
CREATE TABLE IF NOT EXISTS Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    SessionID VARCHAR(100) NOT NULL,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (GameID, SessionID)
);

-- Table 8: AdminAddGame
CREATE TABLE IF NOT EXISTS AdminAddGame (
    AddID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    GameID INT NOT NULL,
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES Administrator(AdminID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE KEY unique_admin_game (AdminID, GameID)
);

-- Table 9: Cart
CREATE TABLE IF NOT EXISTS Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    SessionID VARCHAR(100) NOT NULL,
    Quantity INT DEFAULT 1,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE
);

-- Table 10: User
CREATE TABLE IF NOT EXISTS User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA
-- ============================================

-- Administrators (password for all: admin123)
INSERT INTO Administrator (FirstName, LastName, Age, Address, Email) VALUES
('Admin', 'User', 30, '123 Admin Street, Bangkok', 'admin@gamehub.com'),
('Sarah', 'Johnson', 28, '456 Tech Road, Chiang Mai', 'sarah@gamehub.com'),
('Mike', 'Chen', 35, '789 Game Ave, Phuket', 'mike@gamehub.com');

INSERT INTO AdminLogin (AdminID, Username, Password, Role, LastLoginLog) VALUES
(1, 'admin', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'SuperAdmin', NOW()),
(2, 'sarah', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Manager', NOW()),
(3, 'mike', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Manager', NOW());

-- Genres
INSERT INTO Genre (Name) VALUES
('RPG'), ('Turn-Based'), ('Sci-Fi'), ('Open World'), ('Action'),
('Party'), ('Multiplayer'), ('Social Deduction'), ('FPS'), ('Tactical'),
('Sandbox'), ('Simulation'), ('Survival Horror'), ('Thriller'), ('Action RPG'),
('Stealth'), ('Adventure'), ('Story-Driven'), ('Roguelike'), ('Strategy'),
('Indie'), ('Survival'), ('Sports'), ('Football'), ('Racing'),
('Platformer'), ('Third-Person Shooter');

-- Games (19 games from original data)
INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Honkai: Star Rail', 0.00, 'Free', 0, 'A turn-based role-playing game set in a sci-fi fantasy universe. Players travel across different planets aboard the Astral Express, engaging in strategic combat, following a story-driven narrative, and collecting characters through gacha mechanics.', '2023-04-26', 'https://fastcdn.hoyoverse.com/content-v2/hkrpg/162681/8698fae5d74a28e18f0202a4a894d0f3_5567579011815628028.jpg', '["https://fastcdn.hoyoverse.com/content-v2/hkrpg/162706/df81716190a76d5d73ffd08c884c9a62_5517566128415751305.png","https://fastcdn.hoyoverse.com/content-v2/hkrpg/162589/d7f16733ce24ce17e0a200a4d3f0e870_4485408830878176463.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Genshin Impact', 0.00, 'Free', 0, 'An open-world action RPG set in the fantasy world of Teyvat. Players explore vast regions, solve puzzles, fight enemies using elemental combat systems, and unlock new characters through a gacha-based progression system.', '2020-09-28', 'https://fastcdn.hoyoverse.com/content-v2/plat/124031/5d2ba4371115d26de4c574b28311aed8_3908500551050520494.jpeg', '["https://media.wired.com/photos/5f74d2f4df8a35780989d792/3:2/w_2560%2Cc_limit/Genshin%2520Impact%2520_Keyart.png"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Wuthering Waves', 0.00, 'Free', 0, 'A post-apocalyptic open-world action RPG focused on fast-paced combat and exploration. Players uncover mysteries of a devastated world, battle enemies using combo-based mechanics, and collect characters with unique skills.', '2024-05-22', 'https://gaming-cdn.com/images/products/18945/orig/wuthering-waves-pc-spiel-steam-cover.jpg?v=1749478082', '["https://cdn.oneesports.co.th/cdn-data/sites/3/2024/05/Wuthering-Waves.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Among Us', 110.00, 'Sale', 50, 'A multiplayer social deduction game where players work together to complete tasks on a spaceship while secretly identifying impostors. The game emphasizes communication, deception, and teamwork in short match sessions.', '2018-06-15', 'https://cdn.aptoide.com/imgs/d/4/6/d460a63e167a534bc7b9e4f1eaeed7dc_fgraphic.png', '["https://img.4gamers.com.tw/ckfinder-th/image2/auto/2024-03/Among-Us-240329-003453.png","https://static0.thegamerimages.com/wordpress/wp-content/uploads/2023/11/among-us-impostor.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Valorant', 0.00, 'Free', 0, 'A competitive 5v5 tactical first-person shooter combining precise gunplay with unique character abilities. Players choose agents with distinct skills and compete in strategic, team-based matches.', '2020-06-02', 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-e1dab02ef10e4470a609affcfb8f1a1a', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Roblox', 0.00, 'Free', 0, 'An online platform that allows users to create, share, and play millions of user-generated games. Roblox supports a wide range of genres and social interactions through community-created experiences.', '2006-09-01', 'https://images.rbxcdn.com/28ab48fcd5d5b19b03c126d2b6aef4b8.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Resident Evil Requiem', 1890.00, 'Regular', 0, 'The next survival horror entry in the long-running Resident Evil series. Play as FBI analyst Grace Ashcroft facing the horrors of a ruined Raccoon City, combining survival-focused exploration, puzzles, tense combat, and cinematic storytelling.', '2026-02-27', 'https://image.api.playstation.com/vulcan/ap/rnd/202512/1205/74bb57eb10447ae35775f625271f202360bae45cb3572da5.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Cyberpunk 2077', 1799.00, 'Sale', 55, 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.', '2020-12-10', 'https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077_CDPROJEKTRED_S1_03_2560x1440-359e77d3cd0a40aebf3bbc130d14c5c7', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Monster Hunter Wilds', 2390.00, 'Sale', 11, 'A major installment in the Monster Hunter series where players explore vast biomes, take down massive monsters with a team, and craft gear from harvested parts.', '2025-02-28', 'https://image.api.playstation.com/vulcan/ap/rnd/202409/0506/aa5c40ba185302dfcc88edc276a876fdc6c516c4db07ec9d.png', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Assassin''s Creed Shadows', 1990.00, 'Regular', 0, 'A blockbuster entry in the Assassin''s Creed franchise featuring stealth, parkour, and historical open-world exploration with a rich narrative.', '2025-03-20', 'https://cdn1.epicgames.com/offer/14a28903e3d14bd5aa3e6dbf10868126/EN_EGST_StoreLandscape_2560x1440_2560x1440-35f77ef342bb2d3a3efac25f4fa4d4e0', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Final Fantasy VII Rebirth', 1990.00, 'Sale', 17, 'The acclaimed sequel in the Final Fantasy VII remake trilogy, combining real-time action and deep RPG mechanics, released on PC after its console debut.', '2025-01-23', 'https://cdn1.epicgames.com/offer/e9a679451d094c1ba3d008b6a01adec5/EGS_FINALFANTASYVIIREBIRTH_SquareEnix_S1_2560x1440-e254f978084058f898118dc49728d04c', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Death Stranding 2: On the Beach', 2390.00, 'Regular', 0, 'A story-rich open-world action adventure where you reconnect a fractured world using strategic traversal and cinematic gameplay.', '2026-03-19', 'https://www.kojimaproductions.jp/sites/default/files/2025-12/wellcome_ds2_pc_0.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Mewgenics', 990.00, 'Regular', 0, 'A quirky indie hit featuring strategic roguelike mechanics where players breed and evolve mutant cats with unique traits to battle enemies.', '2026-02-10', 'https://frvr.com/wp-content/uploads/2026/02/mewgenics-release-date-and-times.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('The Last of Us Part I', 1690.00, 'Sale', 50, 'Discover the award-winning game that inspired the critically acclaimed television show. Guide Joel and Ellie through a post-apocalyptic America, and encounter unforgettable allies and enemies.', '2023-03-28', 'https://cdn1.epicgames.com/offer/0c40923dd1174a768f732a3b013dcff2/EGS_TheLastofUsPartI_NaughtyDogLLC_S1_2560x1440-3659b5fe340f8fc073257975b20b7f84', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('EA SPORTS FC 26', 1999.00, 'Regular', 0, 'The Club is Yours in EA SPORTS FC 26. Play your way with an overhauled gameplay experience powered by community feedback, Manager Live Challenges that bring fresh storylines to the new season.', '2025-09-26', 'https://cdn1.epicgames.com/offer/1d4d85b1051e41ee8f1a099e99d59f3f/EGS_EASPORTSFC26StandardEdition_EACANADA_S1_2560x1440-efabe29766334696db018632ea5ba492', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('F1 25', 1599.00, 'Sale', 60, 'Leave your mark on the world of racing in F1 25, the official video game of the 2025 FIA Formula One World Championship, featuring a revamped My Team mode and the thrilling third chapter of Braking Point.', '2025-05-30', 'https://image.api.playstation.com/vulcan/ap/rnd/202505/1521/ca36c3ae7641a273ff3f00e63732fb76e2850c57f577d6eb.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('REMATCH', 590.00, 'Regular', 0, 'Rematch is an online multiplayer football game. Control one player and compete with your team in fast-paced 5v5 matches from an immersive third-person perspective.', '2025-06-19', 'https://media.online-station.net/images/2025/06/0b52bc5e524a1fc830f95eb1e98955e5.jpg', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Hollow Knight: Silksong', 400.00, 'Regular', 0, 'Discover a vast, haunted kingdom in Hollow Knight: Silksong! Explore, fight and survive as you ascend to the peak of a land ruled by silk and song.', '2025-09-04', 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/store/software/switch2/70010000105851/8787627be7f26ae7984456ffd9af17bea845032cebbf59fe6eeb596dea6bb20e', NULL);

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Resident Evil 4', 1090.00, 'Regular', 0, 'Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City. Leon S. Kennedy, one of the survivors, tracks the president''s kidnapped daughter to a secluded European village.', '2023-03-24', 'https://thethaiger.com/th/wp-content/uploads/2023/03/Resident-Evil-4-Remake.jpg', NULL);

-- GameGenre mappings (Game ID -> Genre ID)
-- Game 1: Honkai: Star Rail -> RPG(1), Turn-Based(2), Sci-Fi(3)
INSERT INTO GameGenre (GameID, GenreID) VALUES (1,1),(1,2),(1,3);
-- Game 2: Genshin Impact -> RPG(1), Open World(4), Action(5)
INSERT INTO GameGenre (GameID, GenreID) VALUES (2,1),(2,4),(2,5);
-- Game 3: Wuthering Waves -> RPG(1), Action(5), Open World(4)
INSERT INTO GameGenre (GameID, GenreID) VALUES (3,1),(3,5),(3,4);
-- Game 4: Among Us -> Party(6), Multiplayer(7), Social Deduction(8)
INSERT INTO GameGenre (GameID, GenreID) VALUES (4,6),(4,7),(4,8);
-- Game 5: Valorant -> FPS(9), Tactical(10), Multiplayer(7)
INSERT INTO GameGenre (GameID, GenreID) VALUES (5,9),(5,10),(5,7);
-- Game 6: Roblox -> Sandbox(11), Simulation(12), Multiplayer(7)
INSERT INTO GameGenre (GameID, GenreID) VALUES (6,11),(6,12),(6,7);
-- Game 7: Resident Evil Requiem -> Survival Horror(13), Action(5), Thriller(14)
INSERT INTO GameGenre (GameID, GenreID) VALUES (7,13),(7,5),(7,14);
-- Game 8: Cyberpunk 2077 -> RPG(1), Action(5), Open World(4)
INSERT INTO GameGenre (GameID, GenreID) VALUES (8,1),(8,5),(8,4);
-- Game 9: Monster Hunter Wilds -> Action RPG(15), Open World(4), Multiplayer(7)
INSERT INTO GameGenre (GameID, GenreID) VALUES (9,15),(9,4),(9,7);
-- Game 10: Assassin's Creed Shadows -> Action(5), Open World(4), Stealth(16)
INSERT INTO GameGenre (GameID, GenreID) VALUES (10,5),(10,4),(10,16);
-- Game 11: Final Fantasy VII Rebirth -> Action RPG(15), Adventure(17), Story-Driven(18)
INSERT INTO GameGenre (GameID, GenreID) VALUES (11,15),(11,17),(11,18);
-- Game 12: Death Stranding 2 -> Action(5), Open World(4), Adventure(17)
INSERT INTO GameGenre (GameID, GenreID) VALUES (12,5),(12,4),(12,17);
-- Game 13: Mewgenics -> Roguelike(19), Strategy(20), Indie(21)
INSERT INTO GameGenre (GameID, GenreID) VALUES (13,19),(13,20),(13,21);
-- Game 14: The Last of Us Part I -> Action(5), Adventure(17), Survival(22)
INSERT INTO GameGenre (GameID, GenreID) VALUES (14,5),(14,17),(14,22);
-- Game 15: EA SPORTS FC 26 -> Sports(23), Simulation(12), Football(24)
INSERT INTO GameGenre (GameID, GenreID) VALUES (15,23),(15,12),(15,24);
-- Game 16: F1 25 -> Racing(25), Simulation(12), Sports(23)
INSERT INTO GameGenre (GameID, GenreID) VALUES (16,25),(16,12),(16,23);
-- Game 17: REMATCH -> Sports(23), Multiplayer(7), Football(24)
INSERT INTO GameGenre (GameID, GenreID) VALUES (17,23),(17,7),(17,24);
-- Game 18: Hollow Knight: Silksong -> Action(5), Adventure(17), Platformer(26)
INSERT INTO GameGenre (GameID, GenreID) VALUES (18,5),(18,17),(18,26);
-- Game 19: Resident Evil 4 -> Survival Horror(13), Action(5), Third-Person Shooter(27)
INSERT INTO GameGenre (GameID, GenreID) VALUES (19,13),(19,5),(19,27);

-- Reviews (20 reviews across games)
INSERT INTO Review (GameID, ReviewerName, Rating, Comment) VALUES
(1, 'GamerX', 5, 'Incredible story and amazing turn-based combat!'),
(1, 'StarRailFan', 4, 'Great gacha game with generous rewards.'),
(2, 'TeyvatExplorer', 5, 'The open world is breathtaking and the combat system is so fun.'),
(2, 'CasualPlayer', 4, 'Beautiful game but gacha can be frustrating.'),
(3, 'WaveRider', 4, 'Smooth combat and great exploration mechanics.'),
(4, 'CrewMate99', 5, 'Best party game ever! Always a blast with friends.'),
(4, 'SusPlayer', 3, 'Fun but gets repetitive after a while.'),
(5, 'TacShooter', 5, 'Best tactical shooter on the market right now.'),
(7, 'HorrorFan', 5, 'Terrifying and atmospheric. Classic Resident Evil.'),
(8, 'NightCityV', 4, 'After patches, this game is a masterpiece.'),
(8, 'CyberRunner', 5, 'Night City is incredible. Story had me hooked.'),
(9, 'HunterPro', 4, 'Monster designs are amazing. Co-op is a blast.'),
(10, 'StealthMaster', 4, 'Beautiful open world Japan. Stealth gameplay is satisfying.'),
(11, 'CloudStrife', 5, 'The best JRPG remake ever made. Emotional journey.'),
(12, 'StrandedFan', 4, 'Kojima does it again. Unique and thought-provoking.'),
(14, 'SurvivorJoel', 5, 'A masterpiece of storytelling. The PC port is excellent.'),
(15, 'FootyGamer', 3, 'Good improvements but still has some bugs.'),
(16, 'RaceFan', 4, 'Best F1 game yet. Career mode is addictive.'),
(18, 'MetroidFan', 5, 'Worth the wait! Silksong is a perfect sequel.'),
(19, 'LeonFan', 5, 'The remake is phenomenal. Improved in every way.');

-- AdminAddGame records (which admin added which game)
INSERT INTO AdminAddGame (AdminID, GameID) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),
(2,8),(2,9),(2,10),(2,11),(2,12),
(3,13),(3,14),(3,15),(3,16),(3,17),(3,18),(3,19);

-- Users (password for all: password123 — same bcrypt hash as admin123 for demo)
INSERT INTO User (Username, Email, Password, FirstName, LastName) VALUES
('john_doe', 'john@email.com', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'John', 'Doe'),
('jane_smith', 'jane@email.com', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Jane', 'Smith'),
('alex_gamer', 'alex@email.com', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Alex', 'Wong'),
('player_one', 'player1@email.com', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Sam', 'Lee'),
('pro_gamer', 'pro@email.com', '$2a$10$9Hms4xbPnYKBTdqHIfNB/OsrwRQF1KwLCLVr07DVlBst398uCZip.', 'Chris', 'Park');
