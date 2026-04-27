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
    Email VARCHAR(150) UNIQUE NOT NULL,
    Role VARCHAR(50) DEFAULT 'Admin'
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

-- Table 7: User
CREATE TABLE IF NOT EXISTS User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: Wishlist (SessionID for anonymous, UserID for logged-in users)
CREATE TABLE IF NOT EXISTS Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    SessionID VARCHAR(100) NOT NULL,
    UserID INT NULL,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE SET NULL,
    UNIQUE KEY unique_wishlist (GameID, SessionID)
);

-- Table 9: AdminAddGame
CREATE TABLE IF NOT EXISTS AdminAddGame (
    AddID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    GameID INT NOT NULL,
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES Administrator(AdminID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE KEY unique_admin_game (AdminID, GameID)
);

-- Table 10: Cart (SessionID for anonymous, UserID for logged-in users, max 1 per game)
CREATE TABLE IF NOT EXISTS Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    SessionID VARCHAR(100) NOT NULL,
    UserID INT NULL,
    Quantity INT DEFAULT 1,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE SET NULL
);

-- ============================================
-- SEED DATA
-- ============================================

-- Administrators (password for all: admin123)
INSERT INTO Administrator (FirstName, LastName, Age, Address, Email, Role) VALUES
('Admin', 'User', 30, '123 Admin Street, Bangkok', 'admin@gamehub.com', 'Super Admin'),
('Sarah', 'Johnson', 28, '456 Tech Road, Chiang Mai', 'sarah@gamehub.com', 'Content Manager'),
('Mike', 'Chen', 35, '789 Game Ave, Phuket', 'mike@gamehub.com', 'Content Manager');

INSERT INTO AdminLogin (AdminID, Username, Password, Role, LastLoginLog) VALUES
(1, 'admin', '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Super Admin', NOW()),
(2, 'sarah', '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',     NOW()),
(3, 'mike',  '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',     NOW());

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
('Honkai: Star Rail', 0.00, 'Free', 0, 'A turn-based role-playing game set in a sci-fi fantasy universe. Players travel across different planets aboard the Astral Express, engaging in strategic combat, following a story-driven narrative, and collecting characters through gacha mechanics.', '2023-04-26', '/images/games/Honkai_StarRail/front.jpg', '["https://fastcdn.hoyoverse.com/content-v2/hkrpg/162706/df81716190a76d5d73ffd08c884c9a62_5517566128415751305.png","https://fastcdn.hoyoverse.com/content-v2/hkrpg/162589/d7f16733ce24ce17e0a200a4d3f0e870_4485408830878176463.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Genshin Impact', 0.00, 'Free', 0, 'An open-world action RPG set in the fantasy world of Teyvat. Players explore vast regions, solve puzzles, fight enemies using elemental combat systems, and unlock new characters through a gacha-based progression system.', '2020-09-28', '/images/games/GenshinImpact/front.jpg', '["https://media.wired.com/photos/5f74d2f4df8a35780989d792/3:2/w_2560%2Cc_limit/Genshin%2520Impact%2520_Keyart.png"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Wuthering Waves', 0.00, 'Free', 0, 'A post-apocalyptic open-world action RPG focused on fast-paced combat and exploration. Players uncover mysteries of a devastated world, battle enemies using combo-based mechanics, and collect characters with unique skills.', '2024-05-22', '/images/games/WutheringWaves/front.jpg', '["https://cdn.oneesports.co.th/cdn-data/sites/3/2024/05/Wuthering-Waves.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Among Us', 110.00, 'Sale', 50, 'A multiplayer social deduction game where players work together to complete tasks on a spaceship while secretly identifying impostors. The game emphasizes communication, deception, and teamwork in short match sessions.', '2018-06-15', '/images/games/AmongUs/front.jpg', '["https://img.4gamers.com.tw/ckfinder-th/image2/auto/2024-03/Among-Us-240329-003453.png","https://static0.thegamerimages.com/wordpress/wp-content/uploads/2023/11/among-us-impostor.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Valorant', 0.00, 'Free', 0, 'A competitive 5v5 tactical first-person shooter combining precise gunplay with unique character abilities. Players choose agents with distinct skills and compete in strategic, team-based matches.', '2020-06-02', '/images/games/Valorant/front.jpg', '["/images/games/Valorant/detail_1.jpg","/images/games/Valorant/detail_2.jpg","/images/games/Valorant/detail_3.jpg","/images/games/Valorant/detail_4.jpg","/images/games/Valorant/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Roblox', 0.00, 'Free', 0, 'An online platform that allows users to create, share, and play millions of user-generated games. Roblox supports a wide range of genres and social interactions through community-created experiences.', '2006-09-01', '/images/games/Roblox/front.jpg', '["/images/games/Roblox/detail_1.jpg","/images/games/Roblox/detail_2.jpg","/images/games/Roblox/detail_3.jpg","/images/games/Roblox/detail_4.jpg","/images/games/Roblox/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Resident Evil Requiem', 1890.00, 'Regular', 0, 'The next survival horror entry in the long-running Resident Evil series. Play as FBI analyst Grace Ashcroft facing the horrors of a ruined Raccoon City, combining survival-focused exploration, puzzles, tense combat, and cinematic storytelling.', '2026-02-27', '/images/games/ResidentEvilRequiem/front.jpg', '["/images/games/ResidentEvilRequiem/detail_1.jpg","/images/games/ResidentEvilRequiem/detail_2.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Cyberpunk 2077', 1799.00, 'Sale', 55, 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.', '2020-12-10', '/images/games/Cyberpunk2077/front.jpg', '["/images/games/Cyberpunk2077/detail_1.jpg","/images/games/Cyberpunk2077/detail_2.jpg","/images/games/Cyberpunk2077/detail_3.jpg","/images/games/Cyberpunk2077/detail_4.jpg","/images/games/Cyberpunk2077/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Monster Hunter Wilds', 2390.00, 'Sale', 11, 'A major installment in the Monster Hunter series where players explore vast biomes, take down massive monsters with a team, and craft gear from harvested parts.', '2025-02-28', '/images/games/MonsterHunterWilds/front.jpg', '["/images/games/MonsterHunterWilds/detail_1.jpg","/images/games/MonsterHunterWilds/detail_2.jpg","/images/games/MonsterHunterWilds/detail_3.jpg","/images/games/MonsterHunterWilds/detail_4.jpg","/images/games/MonsterHunterWilds/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Assassin''s Creed Shadows', 1990.00, 'Regular', 0, 'A blockbuster entry in the Assassin''s Creed franchise featuring stealth, parkour, and historical open-world exploration with a rich narrative.', '2025-03-20', '/images/games/Assassin_sCreedShadows/front.jpg', '["/images/games/Assassin_sCreedShadows/detail_1.jpg","/images/games/Assassin_sCreedShadows/detail_2.jpg","/images/games/Assassin_sCreedShadows/detail_3.jpg","/images/games/Assassin_sCreedShadows/detail_4.jpg","/images/games/Assassin_sCreedShadows/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Final Fantasy VII Rebirth', 1990.00, 'Sale', 17, 'The acclaimed sequel in the Final Fantasy VII remake trilogy, combining real-time action and deep RPG mechanics, released on PC after its console debut.', '2025-01-23', '/images/games/FinalFantasyVIIRebirth/front.jpg', '["/images/games/FinalFantasyVIIRebirth/detail_1.jpg","/images/games/FinalFantasyVIIRebirth/detail_2.jpg","/images/games/FinalFantasyVIIRebirth/detail_3.jpg","/images/games/FinalFantasyVIIRebirth/detail_4.jpg","/images/games/FinalFantasyVIIRebirth/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Death Stranding 2: On the Beach', 2390.00, 'Regular', 0, 'A story-rich open-world action adventure where you reconnect a fractured world using strategic traversal and cinematic gameplay.', '2026-03-19', '/images/games/DeathStranding2_OntheBeach/front.jpg', '["/images/games/DeathStranding2_OntheBeach/detail_1.jpg","/images/games/DeathStranding2_OntheBeach/detail_2.jpg","/images/games/DeathStranding2_OntheBeach/detail_3.jpg","/images/games/DeathStranding2_OntheBeach/detail_4.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Mewgenics', 990.00, 'Regular', 0, 'A quirky indie hit featuring strategic roguelike mechanics where players breed and evolve mutant cats with unique traits to battle enemies.', '2026-02-10', '/images/games/Mewgenics/front.png', '["/images/games/Mewgenics/detail_1.jpg","/images/games/Mewgenics/detail_2.jpg","/images/games/Mewgenics/detail_3.jpg","/images/games/Mewgenics/detail_4.jpg","/images/games/Mewgenics/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('The Last of Us Part I', 1690.00, 'Sale', 50, 'Discover the award-winning game that inspired the critically acclaimed television show. Guide Joel and Ellie through a post-apocalyptic America, and encounter unforgettable allies and enemies.', '2023-03-28', '/images/games/The Last of Us™ Part I/front.jpg', '["/images/games/The Last of Us™ Part I/detail_1.jpg","/images/games/The Last of Us™ Part I/detail_2.jpg","/images/games/The Last of Us™ Part I/detail_3.jpg","/images/games/The Last of Us™ Part I/detail_4.jpg","/images/games/The Last of Us™ Part I/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('EA SPORTS FC 26', 1999.00, 'Regular', 0, 'The Club is Yours in EA SPORTS FC 26. Play your way with an overhauled gameplay experience powered by community feedback, Manager Live Challenges that bring fresh storylines to the new season.', '2025-09-26', '/images/games/EA SPORTS FC™ 26/front.jpg', '["/images/games/EA SPORTS FC™ 26/detail_1.jpg","/images/games/EA SPORTS FC™ 26/detail_2.jpg","/images/games/EA SPORTS FC™ 26/detail_3.jpg","/images/games/EA SPORTS FC™ 26/detail_4.jpg","/images/games/EA SPORTS FC™ 26/detail_5.jpg","/images/games/EA SPORTS FC™ 26/detail_6.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('F1 25', 1599.00, 'Sale', 60, 'Leave your mark on the world of racing in F1 25, the official video game of the 2025 FIA Formula One World Championship, featuring a revamped My Team mode and the thrilling third chapter of Braking Point.', '2025-05-30', '/images/games/F1® 25/front.jpg', '["/images/games/F1® 25/detail_1.jpg","/images/games/F1® 25/detail_2.jpg","/images/games/F1® 25/detail_3.jpg","/images/games/F1® 25/detail_4.jpg","/images/games/F1® 25/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('REMATCH', 590.00, 'Regular', 0, 'Rematch is an online multiplayer football game. Control one player and compete with your team in fast-paced 5v5 matches from an immersive third-person perspective.', '2025-06-19', '/images/games/REMATCH/front.jpg', '["/images/games/REMATCH/detail_1.jpg","/images/games/REMATCH/detail_2.jpg","/images/games/REMATCH/detail_3.jpg","/images/games/REMATCH/detail_4.jpg","/images/games/REMATCH/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Hollow Knight: Silksong', 400.00, 'Regular', 0, 'Discover a vast, haunted kingdom in Hollow Knight: Silksong! Explore, fight and survive as you ascend to the peak of a land ruled by silk and song.', '2025-09-04', '/images/games/Hollow Knight_ Silksong/front.jpg', '["/images/games/Hollow Knight_ Silksong/detail_1.jpg","/images/games/Hollow Knight_ Silksong/detail_2.jpg","/images/games/Hollow Knight_ Silksong/detail_3.jpg","/images/games/Hollow Knight_ Silksong/detail_4.jpg","/images/games/Hollow Knight_ Silksong/detail_5.jpg"]');

INSERT INTO Game (Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
('Resident Evil 4', 1090.00, 'Regular', 0, 'Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City. Leon S. Kennedy, one of the survivors, tracks the president''s kidnapped daughter to a secluded European village.', '2023-03-24', '/images/games/Resident Evil 4/front.jpg', '["/images/games/Resident Evil 4/detail_1.jpg","/images/games/Resident Evil 4/detail_2.jpg","/images/games/Resident Evil 4/detail_3.jpg","/images/games/Resident Evil 4/detail_4.jpg"]');

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

-- Users (password for all: user123)
INSERT INTO User (Username, Email, Password, FirstName, LastName) VALUES
('john_doe',   'john@email.com',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'John',  'Doe'),
('jane_smith', 'jane@email.com',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Jane',  'Smith'),
('alex_gamer', 'alex@email.com',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Alex',  'Wong'),
('player_one', 'player1@email.com', '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Sam',   'Lee'),
('pro_gamer',  'pro@email.com',     '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Chris', 'Park');

-- ============================================
-- Additional Games (from GAME.csv)
-- ============================================
INSERT IGNORE INTO Genre (Name) VALUES ('Fantasy');

INSERT IGNORE INTO Game (GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
(20, 'Elden Ring', 1790.00, 'Sale', 30, 'Explore a massive fantasy world with challenging combat, dangerous bosses, and hidden secrets.', '2022-02-25',
 '/images/games/Elden Ring/front.jpg',
 '["/images/games/Elden Ring/detail_1.jpg","/images/games/Elden Ring/detail_2.jpg","/images/games/Elden Ring/detail_3.jpg","/images/games/Elden Ring/detail_4.jpg"]');

INSERT IGNORE INTO Game (GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
(21, 'Red Dead Redemption 2', 1599.00, 'Sale', 30, 'Story-driven western adventure with realistic open-world exploration, missions, and memorable characters.', '2018-10-26',
 '/images/games/Red Dead Redemption 2/front.jpg',
 '["/images/games/Red Dead Redemption 2/detail_1.jpg","/images/games/Red Dead Redemption 2/detail_2.jpg","/images/games/Red Dead Redemption 2/detail_3.jpg","/images/games/Red Dead Redemption 2/detail_4.jpg"]');

INSERT IGNORE INTO Game (GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
(22, 'Baldur''s Gate 3', 1799.00, 'Regular', 0, 'Party-based RPG where your choices shape the story and battles use tactical turn-based combat.', '2023-08-03',
 '/images/games/Baldur_s Gate 3/front.jpg',
 '["/images/games/Baldur_s Gate 3/detail_1.jpg","/images/games/Baldur_s Gate 3/detail_2.jpg","/images/games/Baldur_s Gate 3/detail_3.jpg","/images/games/Baldur_s Gate 3/detail_4.jpg"]');

INSERT IGNORE INTO Game (GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
(23, 'Stardew Valley', 315.00, 'Regular', 0, 'Build a farm, grow crops, explore caves, fish, and make friends in a peaceful town.', '2016-02-26',
 '/images/games/Stardew Valley/front.jpg',
 '["/images/games/Stardew Valley/detail_1.jpg","/images/games/Stardew Valley/detail_2.jpg","/images/games/Stardew Valley/detail_3.jpg","/images/games/Stardew Valley/detail_4.jpg"]');

INSERT IGNORE INTO Game (GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages) VALUES
(24, 'Terraria', 220.00, 'Regular', 0, 'Dig, build, craft, and fight powerful bosses in a huge 2D sandbox world.', '2011-05-16',
 '/images/games/Terraria/front.jpg',
 '["/images/games/Terraria/detail_1.jpg","/images/games/Terraria/detail_2.jpg","/images/games/Terraria/detail_3.jpg","/images/games/Terraria/detail_4.jpg"]');

-- GameGenre for new games
-- Game 20: Elden Ring -> Action RPG(15), Open World(4), Fantasy(28)
INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (20,15),(20,4),(20,28);
-- Game 21: Red Dead Redemption 2 -> Action(5), Open World(4), Adventure(17)
INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (21,5),(21,4),(21,17);
-- Game 22: Baldur's Gate 3 -> RPG(1), Strategy(20), Turn-Based(2)
INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (22,1),(22,20),(22,2);
-- Game 23: Stardew Valley -> Simulation(12), RPG(1), Indie(21)
INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (23,12),(23,1),(23,21);
-- Game 24: Terraria -> Sandbox(11), Survival(22), Adventure(17)
INSERT IGNORE INTO GameGenre (GameID, GenreID) VALUES (24,11),(24,22),(24,17);

-- AdminAddGame for new games
INSERT IGNORE INTO AdminAddGame (AdminID, GameID) VALUES
(1,20),(1,21),(1,22),(1,23),(1,24);

-- Additional seed data (10+ records per table)

-- Add 7 more Administrators (total -> 10)
INSERT IGNORE INTO Administrator (AdminID, FirstName, LastName, Age, Address, Email, Role) VALUES
(4,  'Lisa',     'Park',    26, '321 Dev Lane, Bangkok',       'lisa@gamehub.com',     'Manager'),
(5,  'Tom',      'Wilson',  32, '654 Code St, Pattaya',        'tom@gamehub.com',      'Manager'),
(6,  'Emma',     'Davis',   29, '987 Script Ave, Chiang Rai',  'emma@gamehub.com',     'Manager'),
(7,  'James',    'Kim',     31, '111 Api Blvd, Hat Yai',       'james@gamehub.com',    'Manager'),
(8,  'Sophia',   'Lee',     27, '222 Query Rd, Nonthaburi',    'sophia@gamehub.com',   'Moderator'),
(9,  'Oliver',   'Brown',   34, '333 Index Way, Samut Prakan', 'oliver@gamehub.com',   'Moderator'),
(10, 'Isabella', 'Garcia',  25, '444 Cache St, Rayong',        'isabella@gamehub.com', 'Moderator');

-- Add 7 more AdminLogins (same password hash: admin123)
INSERT IGNORE INTO AdminLogin (AdminID, Username, Password, Role, LastLoginLog) VALUES
(4,  'lisa',     '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',   NOW()),
(5,  'tom',      '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',   NOW()),
(6,  'emma',     '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',   NOW()),
(7,  'james',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Manager',   NOW()),
(8,  'sophia',   '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Moderator', NOW()),
(9,  'oliver',   '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Moderator', NOW()),
(10, 'isabella', '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Moderator', NOW());

-- Add 5 more Users (total -> 10)
INSERT IGNORE INTO User (Username, Email, Password, FirstName, LastName) VALUES
('gamer_thai',   'thai@email.com',   '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Somsak',  'Jaidee'),
('rpg_lover',    'rpg@email.com',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Wanida',  'Sukjai'),
('fps_king',     'fps@email.com',    '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Arjun',   'Patel'),
('indie_fan',    'indie@email.com',  '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Napat',   'Wongkham'),
('casual_play',  'casual@email.com', '$2a$10$Xh5fRfsJD4OVDvQ7ug.1gO69QSKX6yEbEwMn/dv01uFe/efjSBwWe', 'Pranee',  'Chaichan');

-- Add 9 more Wishlist entries (total -> 10) — with UserID for logged-in users
INSERT IGNORE INTO Wishlist (GameID, SessionID, UserID) VALUES
(2,  'sess-demo-0001', 1),
(3,  'sess-demo-0001', 1),
(5,  'sess-demo-0002', 2),
(8,  'sess-demo-0002', 2),
(11, 'sess-demo-0003', 3),
(12, 'sess-demo-0003', 3),
(20, 'sess-demo-0004', 4),
(22, 'sess-demo-0004', 4),
(24, 'sess-demo-0005', 5);

-- Add 8 more Cart entries (total -> 10) — with UserID for logged-in users
INSERT IGNORE INTO Cart (GameID, SessionID, UserID, Quantity) VALUES
(1,  'sess-demo-0001', 1, 1),
(4,  'sess-demo-0001', 1, 1),
(6,  'sess-demo-0002', 2, 1),
(9,  'sess-demo-0002', 2, 1),
(13, 'sess-demo-0003', 3, 1),
(16, 'sess-demo-0003', 3, 1),
(21, 'sess-demo-0004', 4, 1),
(23, 'sess-demo-0005', 5, 1);

-- Additional reviews for new games

INSERT INTO Review (GameID, ReviewerName, Rating, Comment) VALUES
-- Wuthering Waves
(3,  'WaveRider2',    5, 'The combat system is incredibly satisfying. Fast-paced and fluid.'),
(3,  'OpenWorldFan',  4, 'Beautiful world to explore. Story takes a while to pick up but worth it.'),
-- Among Us
(4,  'ImpostorPro',   5, 'Never gets old! The social deduction is pure genius.'),
-- Valorant
(5,  'AgentMain',     4, 'Great agent variety and map design. Ranked is addictive.'),
(5,  'CompPlayer',    5, 'Best competitive shooter out there. Tight gunplay and skill ceiling is high.'),
-- Roblox
(6,  'BlockBuilder',  4, 'So much creativity here. You can find a game for any mood.'),
-- Cyberpunk 2077
(8,  'V_Player',      5, 'The Phantom Liberty DLC elevated this game to a 10/10 experience.'),
-- Death Stranding 2
(12, 'KojimaFan',     5, 'Another masterpiece. The story is deeply emotional and the traversal is meditative.'),
-- Mewgenics
(13, 'CatLover',      5, 'The most unique roguelike I have played. Cat breeding mechanics are wild.'),
-- Elden Ring (new)
(20, 'TarnishedOne',  5, 'A landmark in open-world design. Every corner hides a secret.'),
(20, 'SoulsFan',      4, 'Brutal but fair. The satisfaction of beating a boss is unmatched.'),
(20, 'CasualTried',   3, 'Very challenging for newcomers but the world is gorgeous.'),
-- Red Dead Redemption 2 (new)
(21, 'CowboyArthur',  5, 'The most immersive open world ever created. Arthur Morgan is unforgettable.'),
(21, 'WesternLover',  5, 'A cinematic masterpiece. The story had me emotional multiple times.'),
-- Baldur Gate 3 (new)
(22, 'DnDMaster',     5, 'Best RPG of the decade. The depth of choices and consequences is staggering.'),
(22, 'Tav_Player',    5, 'Every playthrough feels completely different. Incredible replayability.'),
(22, 'CasualRPG',     4, 'Long but never boring. Combat takes time to learn but is rewarding.'),
-- Stardew Valley (new)
(23, 'FarmLife',      5, 'The most relaxing and satisfying game. Perfect stress relief.'),
(23, 'JRPGFan',       4, 'Surprisingly deep. I spent 200 hours and still discovering new things.'),
-- Terraria (new)
(24, 'DiamondPickaxe',5, 'So much content for the price. The boss progression is fantastic.'),
(24, 'BuilderPro',    4, 'More content than most full-price games. A timeless classic.');

-- ============================================
-- Schema v3: Role in Administrator, UserID in Cart/Wishlist, 15+ records per table
-- ============================================
-- Administrator roles
UPDATE Administrator SET Role = 'Super Admin'     WHERE AdminID = 1;
UPDATE Administrator SET Role = 'Content Manager' WHERE AdminID IN (2, 3);
UPDATE Administrator SET Role = 'Manager'         WHERE AdminID IN (4, 5, 6, 7);
UPDATE Administrator SET Role = 'Moderator'       WHERE AdminID IN (8, 9, 10);

INSERT IGNORE INTO Administrator (AdminID, FirstName, LastName, Age, Address, Email, Role) VALUES
(11,'Lucas',  'Martinez',28,'555 Node Way, Bangkok',      'lucas@gamehub.com',  'Manager'),
(12,'Mia',    'Johnson', 30,'666 React Blvd, Chiang Mai', 'mia@gamehub.com',    'Manager'),
(13,'Noah',   'Williams',26,'777 Vue St, Phuket',          'noah@gamehub.com',   'Moderator'),
(14,'Olivia', 'Taylor',  33,'888 Angular Ave, Hua Hin',   'olivia@gamehub.com', 'Moderator'),
(15,'Ethan',  'Anderson',29,'999 Express Rd, Nakhon',     'ethan@gamehub.com',  'Content Manager');

INSERT IGNORE INTO AdminLogin (AdminID, Username, Password, Role, LastLoginLog) VALUES
(11,'lucas', '$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Manager',         NOW()),
(12,'mia',   '$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Manager',         NOW()),
(13,'noah',  '$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Moderator',       NOW()),
(14,'olivia','$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Moderator',       NOW()),
(15,'ethan', '$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Content Manager', NOW());

INSERT IGNORE INTO User (Username, Email, Password, FirstName, LastName) VALUES
('space_gamer',   'space@email.com','$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Alex',  'Chen'),
('night_hunter',  'night@email.com','$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Sara',  'Kim'),
('pixel_master',  'pixel@email.com','$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Mike',  'Ross'),
('loot_goblin',   'loot@email.com', '$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Tanya', 'Singh'),
('open_world_fan','world@email.com','$2a$10$7xnat2HXv8ZduAf6eiOjx.0koiNuRNWhg4Hf61pwzTaxKhYwvcE6i','Leo',   'Tanaka');

INSERT IGNORE INTO Wishlist (GameID, SessionID, UserID) VALUES
(7,  'sess-user-0001',1),(10,'sess-user-0001',1),(14,'sess-user-0002',2),(17,'sess-user-0002',2),(19,'sess-user-0003',3);

INSERT IGNORE INTO Cart (GameID, SessionID, UserID, Quantity) VALUES
(2,'sess-user-0001',1,1),(11,'sess-user-0002',2,1),(18,'sess-user-0002',2,1),(20,'sess-user-0003',3,1),(22,'sess-user-0004',4,1);