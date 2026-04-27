# GameHub — Project Report Reference

> Use this document as a reference when writing your project report for Phases I and II.
> Each section below maps to a required section in the report.

---

## 1. Cover Page

Include the following information on the cover page:

- **Faculty Name:** Faculty of Information and Communication Technology (ICT)
- **Unit Name:** Web Development (or your specific unit/course name)
- **Project Name:** GameHub — Game Store Web Application
- **Members:**

| Name                    | Student ID | Role               |
| ----------------------- | ---------- | ------------------ |
| Promdpoori Athipornwanit| 6788004    | Frontend Developer |
| Numning Sungkagul       | 6788121    | Backend Developer  |
| Kasidech Thongpakdee    | 6788134    | Database Designer  |
| Nannalin Leelaparung    | 6788181    | UI/UX Designer     |

---

## 2. Project Overview

**GameHub** is a full-stack game store web application that allows users to browse, search, and purchase games online. The project is split into two phases:

### Phase I — Frontend Development
- Built a responsive multi-page website using **HTML5, CSS3, and JavaScript**.
- Designed 9 pages: Home, Browse Games, Game Detail, Shopping Cart, Wishlist, User Login/Register, Team, Admin Login, and Admin Dashboard.
- Implemented a dark-themed gaming UI with carousels, search filters, image galleries, and responsive navigation.

### Phase II — Backend & Web Services
- Developed a **Node.js + Express** backend API server providing RESTful web services.
- Connected to a **MySQL** database with 10 tables for storing games, users, reviews, cart, wishlist, and admin data.
- Implemented full **CRUD operations** for game management via the admin dashboard.
- Integrated the **FreeToGame public API** as a proxy web service to display latest free-to-play game releases on the homepage.
- Frontend and backend run on **separate servers** (ports 5500 and 3000) communicating via REST API calls.

### Key Technologies

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Frontend   | HTML5, CSS3, Vanilla JavaScript |
| Backend    | Node.js, Express.js             |
| Database   | MySQL                           |
| Auth       | bcryptjs (password hashing)     |
| Public API | FreeToGame API (no key needed)  |

---

## 3. Navigation Diagram

Below is the navigation flow of the GameHub web application. Use this to create a diagram in your report (e.g., using draw.io, Lucidchart, or PowerPoint).

```
                        ┌─────────────┐
                        │  Home Page  │
                        │  /home      │
                        └──────┬──────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
     │ Browse Games│   │  Team Page  │   │ Admin Login │
     │ /games      │   │  /team      │   │ /admin/login│
     └──────┬──────┘   └─────────────┘   └──────┬──────┘
            │                                    │
     ┌──────▼──────┐                      ┌──────▼──────┐
     │ Game Detail │                      │   Admin     │
     │ /game?id=X  │                      │  Dashboard  │
     └──────┬──────┘                      │  /admin     │
            │                             └─────────────┘
     ┌──────┴──────────────┐
     │                     │
┌────▼─────┐        ┌─────▼─────┐
│ Shopping │        │  Wishlist  │
│  Cart    │        │ /wishlist  │
│  /cart   │        └───────────┘
└──────────┘

     ┌─────────────┐
     │User Account │  (accessible from any page via navbar)
     │ /account    │
     └─────────────┘
```

### Page Navigation Summary

| From Page       | Navigates To                                           |
| --------------- | ------------------------------------------------------ |
| Home (`/home`)  | Browse Games, Game Detail, Team, Wishlist, Cart, Admin  |
| Browse Games    | Game Detail (click any game card)                      |
| Game Detail     | Back to Browse, Add to Cart, Add to Wishlist           |
| Cart            | Browse Games (if empty), Checkout                      |
| Wishlist        | Game Detail, Add to Cart                               |
| User Account    | Home (after login/register)                            |
| Admin Login     | Admin Dashboard (after authentication)                 |
| Admin Dashboard | Home, Browse Games, Team, Logout                       |

### Navigation Bar (present on all pages)

The navbar provides links to: **Home**, **Games**, **Team**, **Wishlist**, **Cart**, **Account**, and **Admin**.

---

## 4. Details of Web Application and Code

### 4.1 Frontend Architecture

The frontend consists of **9 HTML pages** served by an Express server with clean URL routing.

| Page              | File              | URL Route      | Description                              |
| ----------------- | ----------------- | -------------- | ---------------------------------------- |
| Home              | `index.html`      | `/home`        | Featured game, carousels, news section   |
| Browse Games      | `search.html`     | `/games`       | Search by title, genre, price filters    |
| Game Detail       | `detail.html`     | `/game?id=X`   | Gallery, info, reviews, wishlist toggle  |
| Shopping Cart     | `cart.html`       | `/cart`        | Cart items, quantities, order summary    |
| Wishlist          | `wishlist.html`   | `/wishlist`    | Saved games with move-to-cart action     |
| User Login        | `user-login.html` | `/account`     | Tab-based sign in / register forms       |
| Team              | `team.html`       | `/team`        | Team member cards with social links      |
| Admin Login       | `login.html`      | `/admin/login` | Admin authentication form                |
| Admin Dashboard   | `admin.html`      | `/admin`       | Game management table with CRUD modal    |

### 4.2 Frontend Server (`sec2_gr12_fe_src/server.js`)

- Serves static files (CSS, JS) and maps clean URLs to HTML files.
- Old `.html` URLs redirect (301) to clean URLs for backward compatibility.
- Runs on port **5500**.

### 4.3 CSS Styling (`sec2_gr12_fe_src/css/style.css`)

- Single global stylesheet (64KB) with CSS custom properties for theming.
- Dark theme design with consistent color variables.
- Responsive layout using CSS Grid and Flexbox.

### 4.4 JavaScript Files (`sec2_gr12_fe_src/js/`)

| File            | Lines | Purpose                                          |
| --------------- | ----- | ------------------------------------------------ |
| `home.js`       | ~475  | Homepage carousels, featured banner, news API    |
| `detail.js`     | ~485  | Game detail, gallery slider, reviews, wishlist   |
| `admin.js`      | ~380  | Admin CRUD, modal forms, genre checkboxes        |
| `search.js`     | ~154  | Multi-criteria search, URL param parsing         |
| `cart.js`       | ~170  | Cart display, quantity update, price calculation  |
| `user-login.js` | ~155  | Tab switching, login/register form handling       |
| `wishlist.js`   | ~140  | Wishlist display, remove, move to cart           |
| `team.js`       | ~92   | Team member card rendering                       |
| `login.js`      | ~79   | Admin login form, localStorage session           |

### 4.5 Backend Architecture

The backend is a **Node.js + Express** RESTful API server.

| File              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `server.js`       | Main entry point, middleware, route registration |
| `config/db.js`    | MySQL connection pool + database initialization |
| `sec2_gr12_database.sql` | 10 tables + seed data (19 games, genres, etc.) |

### 4.6 Backend Route Modules (`sec2_gr12_ws_src/routes/`)

| File           | Endpoints | Key Operations                      |
| -------------- | --------- | ----------------------------------- |
| `games.js`     | 6         | CRUD + search with filters + genres |
| `auth.js`      | 1         | Admin login with bcrypt             |
| `reviews.js`   | 4         | Get, post, stats, delete reviews    |
| `cart.js`      | 6         | Get, add, update, remove, clear, count |
| `wishlist.js`  | 4         | Get, add, remove, check             |
| `users.js`     | 3         | Register, login, get profile        |
| `news.js`      | 1         | FreeToGame API proxy                |

### 4.7 Database Design (10 Tables)

| Table         | Columns | Description                           |
| ------------- | ------- | ------------------------------------- |
| Administrator | 5       | Admin user profile information        |
| AdminLogin    | 5       | Credentials (bcrypt hash), login log  |
| Game          | 9       | Game info, pricing, images            |
| Genre         | 2       | Genre categories                      |
| GameGenre     | 2       | Many-to-many game↔genre mapping       |
| Review        | 5       | User reviews with 1–5 star rating     |
| Wishlist      | 4       | Session-based game wishlist           |
| AdminAddGame  | 3       | Tracks which admin added which game   |
| User          | 7       | Customer accounts (bcrypt passwords)  |
| Cart          | 5       | Session-based shopping cart items     |

---

## 5. Details of Web Services and Code

### 5.1 Web Service Architecture

All web services follow **RESTful conventions**:
- **Base URL:** `http://localhost:3000/api`
- **Format:** JSON request/response
- **Methods:** GET, POST, PUT, DELETE
- **Error handling:** Consistent JSON error responses with HTTP status codes

### 5.2 Game Web Services (`routes/games.js`)

#### Search Service (No Criteria) — GET `/api/games`
- Returns all games when no query parameters are provided.
- Each game includes an attached `Genres` array.

#### Search Service (With Criteria) — GET `/api/games?title=X&genre=Y&minPrice=Z&maxPrice=W`
- Supports filtering by: `title` (partial match), `genre` (exact), `minPrice`, `maxPrice`, `pricingType`.
- Dynamically builds SQL query with parameterized inputs.

#### Insert Service — POST `/api/games`
- Creates a new game record.
- Handles genre association via the `GameGenre` junction table.
- Returns 201 Created with the new game object.

#### Update Service — PUT `/api/games/:id`
- Updates game details and re-syncs genre associations.
- Returns 404 if game not found.

#### Delete Service — DELETE `/api/games/:id`
- Deletes game and cascade-removes associated data.
- Returns 404 if game not found.

### 5.3 Authentication Web Services

#### Admin Login — POST `/api/auth/login`
- Validates username/password against bcrypt-hashed credentials.
- Updates `LastLoginLog` timestamp on success.

#### User Register — POST `/api/users/register`
- Hashes password with bcrypt (10 salt rounds).
- Checks for duplicate username/email (409 Conflict).

#### User Login — POST `/api/users/login`
- Compares password against stored bcrypt hash.
- Returns user profile on success.

### 5.4 Review Web Services (`routes/reviews.js`)
- **GET** `/api/reviews/:gameId` — Returns all reviews sorted by newest.
- **GET** `/api/reviews/stats/:gameId` — Returns average rating, total count, and 5-star distribution percentages.
- **POST** `/api/reviews` — Validates required fields (gameId, reviewerName, rating).
- **DELETE** `/api/reviews/:id` — Removes a review by ID.

### 5.5 Cart Web Services (`routes/cart.js`)
- **POST** `/api/cart` — If game already exists in cart, increments quantity instead of duplicating.
- **PUT** `/api/cart/:cartId` — Validates quantity ≥ 1.
- **DELETE** `/api/cart/clear/:sessionId` — Clears all cart items for a session.

### 5.6 Wishlist Web Services (`routes/wishlist.js`)
- **POST** `/api/wishlist` — Returns 409 Conflict on duplicate entries (SQL unique constraint).
- **GET** `/api/wishlist/check/:sessionId/:gameId` — Returns `{ wishlisted: true/false }`.

### 5.7 Public API Integration — FreeToGame (`routes/news.js`)
- **Purpose:** Fetches latest free-to-play game releases from FreeToGame public API.
- **API URL:** `https://www.freetogame.com/api/games?sort-by=release-date&platform=all`
- **No API key required** — fully free and open.
- The backend acts as a **proxy** to avoid CORS issues on the frontend.
- Returns the 9 most recent releases formatted as news articles.

---

## 6. Testing Results of Web Services (Postman)

> Take screenshots of each test case in Postman and include them in your report.
> Below are the test cases to execute. Each route file in the backend code also contains detailed Postman test case comments.

### 6.1 Game Web Services

| # | Test Case                    | Method | URL                                                    | Body (JSON)                                                                                                                                                                                   | Expected Result                          |
|---|------------------------------|--------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| 1 | Get all games (no criteria)  | GET    | `http://localhost:3000/api/games`                      | —                                                                                                                                                                                             | 200 OK, array of all games               |
| 2 | Search by title              | GET    | `http://localhost:3000/api/games?title=Elden`          | —                                                                                                                                                                                             | 200 OK, games matching "Elden"           |
| 3 | Search by genre              | GET    | `http://localhost:3000/api/games?genre=RPG`            | —                                                                                                                                                                                             | 200 OK, RPG games only                   |
| 4 | Search by price range        | GET    | `http://localhost:3000/api/games?minPrice=0&maxPrice=500` | —                                                                                                                                                                                          | 200 OK, games priced 0–500              |
| 5 | Insert a new game            | POST   | `http://localhost:3000/api/games`                      | `{"title":"Test Game","genres":["Action","RPG"],"price":999,"pricingType":"Regular","salePercent":0,"description":"A test game.","releaseDate":"2026-01-01","imageUrl":"","galleryImages":""}` | 201 Created, new game object             |
| 6 | Insert a free game           | POST   | `http://localhost:3000/api/games`                      | `{"title":"Free Test","genres":["Casual"],"price":0,"pricingType":"Free","salePercent":0,"description":"Free game.","releaseDate":"2026-03-15","imageUrl":"","galleryImages":""}`             | 201 Created, free game object            |
| 7 | Update game                  | PUT    | `http://localhost:3000/api/games/1`                    | `{"title":"Updated Title","genres":["Action"],"price":1299,"pricingType":"Sale","salePercent":25,"description":"Updated.","releaseDate":"2026-01-01","imageUrl":"","galleryImages":""}`       | 200 OK, updated game object              |
| 8 | Update non-existent game     | PUT    | `http://localhost:3000/api/games/99999`                | `{"title":"Ghost","genres":[],"price":0,"pricingType":"Regular","salePercent":0,"description":"","releaseDate":null,"imageUrl":"","galleryImages":""}`                                        | 404 Not Found                            |
| 9 | Delete a game                | DELETE | `http://localhost:3000/api/games/1`                    | —                                                                                                                                                                                             | 200 OK, "Game deleted successfully"      |
|10 | Delete non-existent game     | DELETE | `http://localhost:3000/api/games/99999`                | —                                                                                                                                                                                             | 404 Not Found                            |

### 6.2 Authentication Web Services

| # | Test Case              | Method | URL                                          | Body (JSON)                                    | Expected Result                          |
|---|------------------------|--------|----------------------------------------------|------------------------------------------------|------------------------------------------|
| 1 | Admin login (success)  | POST   | `http://localhost:3000/api/auth/login`        | `{"username":"admin","password":"admin123"}`    | 200 OK, `{ success: true, admin: {...} }`|
| 2 | Admin login (fail)     | POST   | `http://localhost:3000/api/auth/login`        | `{"username":"admin","password":"wrong"}`       | 401 Unauthorized                         |
| 3 | User register          | POST   | `http://localhost:3000/api/users/register`    | `{"username":"john","email":"john@ex.com","password":"pass123","firstName":"John","lastName":"Doe"}` | 201 Created               |
| 4 | User login             | POST   | `http://localhost:3000/api/users/login`       | `{"username":"john","password":"pass123"}`      | 200 OK, `{ success: true, user: {...} }` |

### 6.3 Review Web Services

| # | Test Case              | Method | URL                                          | Body (JSON)                                                              | Expected Result                          |
|---|------------------------|--------|----------------------------------------------|--------------------------------------------------------------------------|------------------------------------------|
| 1 | Get reviews for game   | GET    | `http://localhost:3000/api/reviews/1`         | —                                                                        | 200 OK, array of reviews                 |
| 2 | Get review stats       | GET    | `http://localhost:3000/api/reviews/stats/1`   | —                                                                        | 200 OK, `{ averageRating, totalReviews, distribution }` |
| 3 | Submit a review        | POST   | `http://localhost:3000/api/reviews`           | `{"gameId":1,"reviewerName":"Tester","rating":5,"comment":"Great!"}`     | 201 Created, new review object           |

### 6.4 Cart Web Services

| # | Test Case              | Method | URL                                                   | Body (JSON)                                    | Expected Result                          |
|---|------------------------|--------|-------------------------------------------------------|------------------------------------------------|------------------------------------------|
| 1 | Add to cart            | POST   | `http://localhost:3000/api/cart`                       | `{"gameId":1,"sessionId":"test-session-123"}`  | 201 Created, `{ cartId, message }`       |
| 2 | Get cart items         | GET    | `http://localhost:3000/api/cart/test-session-123`      | —                                              | 200 OK, array of cart items              |
| 3 | Get cart count         | GET    | `http://localhost:3000/api/cart/count/test-session-123`| —                                              | 200 OK, `{ count: N }`                  |
| 4 | Clear cart             | DELETE | `http://localhost:3000/api/cart/clear/test-session-123`| —                                              | 200 OK, "Cart cleared"                   |

### 6.5 Wishlist Web Services

| # | Test Case              | Method | URL                                                          | Body (JSON)                                       | Expected Result                          |
|---|------------------------|--------|--------------------------------------------------------------|---------------------------------------------------|------------------------------------------|
| 1 | Add to wishlist        | POST   | `http://localhost:3000/api/wishlist`                          | `{"gameId":1,"sessionId":"test-session-123"}`     | 201 Created                              |
| 2 | Check if wishlisted    | GET    | `http://localhost:3000/api/wishlist/check/test-session-123/1` | —                                                 | 200 OK, `{ wishlisted: true }`           |
| 3 | Get wishlist           | GET    | `http://localhost:3000/api/wishlist/test-session-123`         | —                                                 | 200 OK, array of wishlisted games        |
| 4 | Remove from wishlist   | DELETE | `http://localhost:3000/api/wishlist/test-session-123/1`       | —                                                 | 200 OK, "Removed from wishlist"          |

### 6.6 Public API (News) Web Service

| # | Test Case                  | Method | URL                                | Expected Result                                           |
|---|----------------------------|--------|------------------------------------|-----------------------------------------------------------|
| 1 | Get gaming news            | GET    | `http://localhost:3000/api/news`   | 200 OK, `{ totalArticles: 9, articles: [...] }`          |

### Tips for Postman Screenshots

1. **Show the full Postman window** including: method, URL, body tab, and response.
2. **Include the status code** (200, 201, 404, etc.) visible in the response.
3. **Group screenshots** by service category (Games, Auth, Reviews, etc.).
4. **Run tests in order** — some tests depend on data from previous tests (e.g., insert before delete).
5. **Set Content-Type header** to `application/json` for POST and PUT requests.

---

## Report Writing Tips

- Use **screenshots** of the actual running application for sections 3–4.
- Include **code snippets** for key backend route handlers (not the entire file).
- For the navigation diagram, use a **visual tool** like draw.io or Lucidchart.
- Reference the **Postman test cases** documented in each backend route file header comment.
- Highlight the **FreeToGame public API integration** as your external web service.
