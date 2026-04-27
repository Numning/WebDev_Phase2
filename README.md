# GameHub — Game Store Web Application

A full-stack web application for a game store built with **HTML/CSS/JS** on the frontend and **Node.js + Express + MySQL** on the backend. The frontend and backend run on **separate web servers** as required by the project specification.

## Project Structure

```
WebDev_Phase2/
├── sec2_gr12_fe_src/       # Frontend server & static files (HTML, CSS, JS)
│   ├── server.js           # Express server with clean URL routing (port 5500)
│   ├── css/style.css       # Global stylesheet
│   ├── js/                 # Page-specific JavaScript files
│   │   ├── home.js         # Homepage logic (carousels, featured, news)
│   │   ├── search.js       # Game search with multi-criteria filtering
│   │   ├── detail.js       # Game detail page (gallery, reviews, wishlist)
│   │   ├── cart.js          # Shopping cart management
│   │   ├── wishlist.js     # Wishlist functionality
│   │   ├── admin.js        # Admin dashboard (CRUD operations)
│   │   ├── login.js        # Admin login authentication
│   │   ├── user-login.js   # User registration & login
│   │   └── team.js         # Team member cards
│   ├── images/             # Local static images
│   │   ├── games/          # Game cover images (front.jpg) and screenshots (detail_N.jpg)
│   │   └── team/           # Team member profile photos (studentId.jpg)
│   ├── index.html          # Home page
│   ├── search.html         # Browse/Search games page
│   ├── detail.html         # Game detail page
│   ├── cart.html            # Shopping cart page
│   ├── wishlist.html       # Wishlist page
│   ├── user-login.html     # User sign in / register page
│   ├── team.html           # Team members page
│   ├── login.html          # Admin login page
│   └── admin.html          # Admin dashboard page
│
├── sec2_gr12_ws_src/        # Backend API server (Node.js + Express)
│   ├── server.js           # Main Express server entry point (port 3000)
│   ├── config/
│   │   └── db.js           # MySQL connection pool + database initialization
│   ├── sec2_gr12_database.sql  # Database schema with 10 tables + seed data
│   ├── routes/             # Express route modules
│   │   ├── games.js        # Game CRUD endpoints (search, insert, update, delete)
│   │   ├── auth.js         # Admin authentication endpoint
│   │   ├── reviews.js      # Review endpoints (get, post, stats, delete)
│   │   ├── wishlist.js     # Wishlist endpoints (get, add, remove, check)
│   │   ├── cart.js         # Cart endpoints (get, add, update, remove, clear)
│   │   ├── users.js        # User registration & login endpoints
│   │   └── news.js         # Public API proxy (FreeToGame API)
│   ├── .env                # Environment variables (edit with your MySQL credentials)
│   └── package.json        # Backend dependencies
│
├── .gitignore              # Git ignore rules (node_modules)
└── README.md               # This file
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MySQL](https://www.mysql.com/) server installed locally and running (tested with MySQL 9.7)

## How to Run

### 1. Configure Database Connection

Edit the `.env` file inside the `sec2_gr12_ws_src/` folder with your MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=game_store

# Server Configuration
PORT=3000
```

> **Note:** The default `.env` file is included in the repository. Update `DB_PASSWORD` to match your local MySQL root password before starting the server.

### 2. Install & Start the Backend Server (Port 3000)

```bash
cd sec2_gr12_ws_src
npm install
npm start
```

The backend server will **automatically**:

1. Create the `game_store` database if it doesn't exist.
2. Create all required tables (10 tables) and insert seed data (**24 games**, genres, admins, reviews, users) on first run.
3. Start the Express API server on port **3000**.

### 3. Install & Start the Frontend Server (Port 5500)

Open a **new terminal** and run:

```bash
cd sec2_gr12_fe_src
npm install
npm start
```

The frontend server will serve all HTML/CSS/JS files on port **5500** with clean URL routing.

### 4. Open in Browser

Visit **http://localhost:5500** to access the application.

> **Important:** Both servers must be running simultaneously. The frontend makes API calls to the backend at `http://localhost:3000/api/`.

## Pages (Frontend)

The frontend is a fully responsive multi-page application with clean URL routing.

| Page            | Clean URL                        | HTML File         |
| --------------- | -------------------------------- | ----------------- |
| Home            | http://localhost:5500/home       | `index.html`      |
| Browse Games    | http://localhost:5500/games      | `search.html`     |
| Game Detail     | http://localhost:5500/game?id=1  | `detail.html`     |
| Shopping Cart   | http://localhost:5500/cart       | `cart.html`       |
| Wishlist        | http://localhost:5500/wishlist   | `wishlist.html`   |
| User Account    | http://localhost:5500/account    | `user-login.html` |
| Team            | http://localhost:5500/team       | `team.html`       |
| Admin Dashboard | http://localhost:5500/admin      | `admin.html`      |
| Admin Login     | http://localhost:5500/admin/login| `login.html`      |

> Old `.html` URLs automatically redirect to clean URLs (e.g., `/index.html` → `/home`).

## Default Admin Credentials

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

## API Endpoints (Backend — Port 3000)

Base URL: `http://localhost:3000/api`

### Customer Authentication

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/users/register`   | Register a new user    |
| POST   | `/api/users/login`      | User login             |
| GET    | `/api/users/:id`        | Get user profile       |

### Admin Authentication

| Method | Endpoint           | Description  |
| ------ | ------------------ | ------------ |
| POST   | `/api/auth/login`  | Admin login  |

### Games (CRUD)

| Method | Endpoint          | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/api/games`      | List/search games (supports query filters)   |
| GET    | `/api/games/:id`  | Get a single game by ID                      |
| POST   | `/api/games`      | Create a new game                            |
| PUT    | `/api/games/:id`  | Update a game                                |
| DELETE | `/api/games/:id`  | Delete a game                                |

**Search filters (query parameters):** `title`, `genre`, `minPrice`, `maxPrice`, `pricingType`

### Reviews

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/api/reviews/:gameId`      | Get reviews for a game     |
| GET    | `/api/reviews/stats/:gameId`| Get rating statistics      |
| POST   | `/api/reviews`              | Submit a new review        |
| DELETE | `/api/reviews/:id`          | Delete a review            |

### Shopping Cart

| Method | Endpoint                       | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/api/cart/:sessionId`         | Get cart items                       |
| GET    | `/api/cart/count/:sessionId`   | Get cart item count                  |
| POST   | `/api/cart`                    | Add a game to cart (1 per game max)  |
| DELETE | `/api/cart/:cartId`            | Remove a single item                 |
| DELETE | `/api/cart/clear/:sessionId`   | Clear entire cart                    |

> **Cart Rule:** Each game can only be added **once per session**. Attempting to add a duplicate returns `{ message: 'Already in cart' }` without creating a duplicate entry.

### Wishlist

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/api/wishlist/:sessionId`            | Get wishlisted games     |
| GET    | `/api/wishlist/check/:sessionId/:gId` | Check if wishlisted      |
| POST   | `/api/wishlist`                       | Add to wishlist          |
| DELETE | `/api/wishlist/:sessionId/:gameId`    | Remove from wishlist     |

### Gaming News (Public API Proxy)

| Method | Endpoint     | Description                                     |
| ------ | ------------ | ----------------------------------------------- |
| GET    | `/api/news`  | Get latest free-to-play game releases            |

## Public Web Service Integration

The homepage integrates the **FreeToGame API** ([freetogame.com/api-doc](https://www.freetogame.com/api-doc)) to display the latest free-to-play game releases. This is a **fully free public API** that requires **no API key** — it works out of the box with no configuration needed.

The backend acts as a proxy at `/api/news` to fetch data from FreeToGame and format it for the frontend. Gaming content appears automatically on the homepage.

## Database

The database consists of **10 tables**:

| Table         | Description                           |
| ------------- | ------------------------------------- |
| Administrator | Admin user information                |
| AdminLogin    | Login credentials and access log      |
| GAME          | Game/product information              |
| Genre         | Game genre categories                 |
| GameGenre     | Many-to-many game-genre mapping       |
| Review        | User-submitted game reviews           |
| Wishlist      | Session-based game wishlist           |
| AdminAddGame  | Tracks which admin added which game   |
| User          | Standard user accounts for customers  |
| Cart          | Shopping cart functionality            |

## Core Frontend Features

- **Storefront Navigation**: Browse games by genre, search by title, and filter by price.
- **Shopping Cart**: Add games to cart (1 copy per game per session), dynamic cart badge, view total subtotal/discounts.
- **Wishlist**: Save games for later and easily move them to cart.
- **User Authentication**: Register and sign-in pages for customers.
- **Admin Dashboard**: Full CRUD system to manage the game catalog, update pricing, and set games on 'Sale' or 'Free'.
- **Gaming News**: Real-time free-to-play game releases from FreeToGame public API.
- **Image Gallery**: Detail page with image slider and thumbnail navigation using **local hosted images**.
- **Review System**: Users can submit and view ratings and reviews for each game with star distribution chart.
- **Team Page**: Real profile photos served from local `/images/team/` directory.

## Tech Stack

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Frontend   | HTML5, CSS3, Vanilla JavaScript |
| Backend    | Node.js, Express.js             |
| Database   | MySQL                           |
| Auth       | bcryptjs (password hashing)     |
| CORS       | cors middleware                  |
| Env Config | dotenv                          |

## Remarks

- The frontend and backend run on **separate servers** (ports 5500 and 3000 respectively).
- CORS is enabled on the backend to allow cross-origin requests from the frontend.
- All seed data (**24 games**, genres, 10 admins, 20+ reviews, 10 users, 10 cart records, 10 wishlist entries) is defined in `sec2_gr12_database.sql`.
- Game images are **hosted locally** under `sec2_gr12_fe_src/images/games/<GameFolder>/` — `front.jpg` is the card image, `detail_N.jpg` files form the gallery slider.
- Team profile photos are hosted locally at `sec2_gr12_fe_src/images/team/<studentId>.jpg`.
- Cart enforces a **1 copy per game** rule per session — adding the same game twice returns an `'Already in cart'` response.
- No Docker required — uses local MySQL server directly.
- Clean URL routing is handled by Express Router on the frontend server.
- The `/images` static route in `server.js` serves all game and team images from the `images/` directory.
