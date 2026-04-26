# GameHub — Game Store Project

A full-stack web application for a game store, featuring a **separate frontend** interface and a **Node.js backend** API with MySQL database. The frontend and backend run on **different web servers** as required by the project specification.

## Project Structure

- **frontend/** (`secX_grY_fe_src`): Static frontend files (HTML, CSS, JS) served by its own Express server.
- **backend/** (`secX_grY_ws_src`): Node.js Express backend server providing RESTful API web services.
- **backend/schema.sql** (`secX_grY_database.sql`): Database schema with 10 tables and all seed data.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MySQL](https://www.mysql.com/) server installed locally and running (tested with MySQL 9.7)

## How to Run

### 1. Configure Database Connection

Copy the example environment file and fill in your MySQL credentials:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=game_store
PORT=3000
GNEWS_API_KEY=your_gnews_api_key_here
```

> **Note:** The `.env` file is excluded from git via `.gitignore` to keep credentials private.

### 2. Install & Start the Backend Server (Port 3000)

```bash
cd backend
npm install
npm start
```

The backend server will **automatically**:

1. Create the `game_store` database if it doesn't exist.
2. Create all required tables (10 tables) and insert seed data (games, genres, admins, reviews, users) on first run.
3. Start the Express API server on port **3000**.

### 3. Install & Start the Frontend Server (Port 5500)

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm start
```

The frontend server will serve all HTML, CSS, and JS files on port **5500**.

### 4. Open in Browser

Visit **http://localhost:5500** to access the application.

> **Important:** Both servers must be running simultaneously. The frontend makes API calls to the backend at `http://localhost:3000/api/`.

## Pages (Frontend)

The frontend is a fully responsive multi-page application.

| Page            | URL                                |
| --------------- | ---------------------------------- |
| Home            | http://localhost:5500/index.html   |
| Search/Browse   | http://localhost:5500/search.html  |
| Game Detail     | http://localhost:5500/detail.html  |
| Shopping Cart   | http://localhost:5500/cart.html    |
| Wishlist        | http://localhost:5500/wishlist.html|
| User Login      | http://localhost:5500/user-login.html |
| Team            | http://localhost:5500/team.html    |
| Admin Dashboard | http://localhost:5500/admin.html   |
| Admin Login     | http://localhost:5500/login.html   |

## Default Admin Credentials

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

## API Endpoints (Backend — Port 3000)

Base URL: `http://localhost:3000/api`

### Customer Authentication
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Normal user login
- `GET /api/users/:id` — Get user profile

### Admin Authentication
- `POST /api/auth/login` — Admin login

### Games (CRUD)
- `GET /api/games` — List/search all games (supports query filters)
- `GET /api/games/:id` — Get a single game by ID
- `POST /api/games` — Create a new game
- `PUT /api/games/:id` — Update a game
- `DELETE /api/games/:id` — Delete a game

### Reviews
- `GET /api/reviews/:gameId` — Get reviews for a game
- `GET /api/reviews/stats/:gameId` — Get rating statistics
- `POST /api/reviews` — Submit a new review

### Shopping Cart
- `GET /api/cart/:sessionId` — Get cart items
- `POST /api/cart` — Add a game to cart
- `PUT /api/cart/:cartId` — Update cart item quantity
- `DELETE /api/cart/:cartId` — Remove a single cart item
- `DELETE /api/cart/clear/:sessionId` — Clear the entire cart

### Wishlist
- `GET /api/wishlist/:sessionId` — Get wishlisted games
- `POST /api/wishlist` — Add to wishlist
- `DELETE /api/wishlist/:sessionId/:gameId` — Remove from wishlist

### Gaming News (Public API Proxy)
- `GET /api/news` — Get latest gaming news (proxied from GNews API)

## Public Web Service Integration

The homepage integrates the **GNews API** (https://gnews.io) to display real-time gaming news headlines. The API key is stored securely on the backend (in `.env`), and the frontend fetches news automatically from the backend proxy at `/api/news` — no user configuration needed on the website.

### Setup
1. Visit [gnews.io](https://gnews.io) and create a free account.
2. Copy your API key from the dashboard.
3. Paste it in `backend/.env` as `GNEWS_API_KEY=your_key_here`.
4. Restart the backend server — gaming news will appear automatically on the homepage.

## Database

The database consists of **10 tables**:

| Table         | Description                           |
| ------------- | ------------------------------------- |
| Administrator | Admin user information               |
| AdminLogin    | Login credentials and access log      |
| GAME          | Game/product information              |
| Genre         | Game genre categories                 |
| GameGenre     | Many-to-many game-genre mapping       |
| Review        | User-submitted game reviews           |
| Wishlist      | Session-based game wishlist           |
| AdminAddGame  | Tracks which admin added which game   |
| User          | Standard user accounts for customers  |
| Cart          | Shopping cart functionality           |

## Core Frontend Features

- **Storefront Navigation**: Browse games by genre, search by title, and filter by price.
- **Shopping Cart**: Add games, update quantities, dynamic cart badge, view total subtotal/discounts.
- **Wishlist**: Save games for later and easily move them to cart.
- **User Authentication**: Register/sign-in pages for customers.
- **Admin Dashboard**: Full CRUD system to manage the game catalog, update pricing, and set games on 'Sale' or 'Free'.

## Remarks

- The frontend and backend run on **separate servers** (ports 5500 and 3000 respectively).
- CORS is enabled on the backend to allow cross-origin requests from the frontend.
- All seed data (19 games, genres, admins, reviews, users) is defined in `schema.sql` as SQL INSERT statements.
- No Docker required — uses local MySQL server directly.
