# GameHub — Game Store Project

A full-stack web application for a game store, featuring a **separate frontend** interface and a **Node.js backend** API with MySQL database. The frontend and backend run on **different web servers** as required by the project specification.

## Project Structure

- **frontend/** (`secX_grY_fe_src`): Static frontend files (HTML, CSS, JS) served by its own Express server.
- **backend/** (`secX_grY_ws_src`): Node.js Express backend server providing RESTful API web services.
- **GameStock.csv**: Game data imported into the database on first run.
- **backend/schema.sql** (`secX_grY_database.sql`): Database schema with 10 tables.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MySQL](https://www.mysql.com/) server (running and accessible)

## How to Run

### 1. Configure Database Connection (if needed)

The default database connection settings are in `backend/db.js`:

| Setting  | Default Value |
| -------- | ------------- |
| Host     | `localhost`   |
| Port     | `3307`        |
| User     | `root`        |
| Password | _(empty)_     |

> **Note:** The default MySQL port is usually `3306`. If your MySQL uses `3306`, update the port in `backend/db.js`.

### 2. Install & Start the Backend Server (Port 3000)

```bash
cd backend
npm install
npm start
```

The backend server will **automatically**:

1. Create the `game_store` database if it doesn't exist.
2. Create all required tables (10 tables) and seed admin data on first run.
3. Import game data from `GameStock.csv`.
4. Start the Express API server on port **3000**.

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

## Public Web Service Integration

The homepage integrates the **CheapShark API** (https://www.cheapshark.com/api) to display real game deals from Steam. This is a free, no-API-key-required public API that provides current game pricing data from multiple online game stores.

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
- Game data is imported from `GameStock.csv` on first database initialization.
