Web Development Project
Phase II

Submitted by
Section X Group Y

| Student ID | First Name  | Last Name      |
|------------|-------------|----------------|
| 6788004    | Promdpoori  | Athipornwanit  |
| 6788121    | Numning     | Sungkagul      |
| 6788134    | Kasidech    | Thongpakdee    |
| 6788181    | Nannalin    | Leelaparung    |

Present to
Dr. Wudhichart Sawangphol
Aj. Jidapa Kraisangka

This report is part of the subject ITCS223
Introduction to Web Development
Semester 2/2025
Mahidol University


---

# Table of Contents

1. Project Overview
2. Navigation Diagram
3. Details of Web Application and Code
4. Details of Web Services and Code
5. Web Service Testing Results
6. Additional Requirements Compliance
7. Deployment and Run Instructions Summary
8. Conclusion
9. Appendix


---

# 1. Project Overview

## 1.1 Project Introduction

This project is a web application developed for the gaming e-commerce domain. GameHub is a full-stack online game store that allows users to browse, search, and purchase games. The platform enables general users to explore a catalog of games organized by genre, view detailed game information with reviews and ratings, manage a shopping cart and wishlist, and create customer accounts. Administrators can log in and manage the game catalog through a dedicated CRUD dashboard. The homepage also integrates a public API (FreeToGame) to display the latest free-to-play game releases.

## 1.2 Objectives

The main objectives of this project are:
- To design and implement a complete e-commerce web application for a game store.
- To develop a front-end using HTML5, CSS3, and vanilla JavaScript with semantic elements and a consistent dark-themed gaming visual identity.
- To create a back-end using Node.js with Express.js and connect it to a MySQL database via the mysql2 library.
- To build web services for administrator authentication, game search with multiple criteria, game detail viewing, and full game management (create, update, delete).
- To build web services for user authentication (register/login), shopping cart, wishlist, and game reviews.
- To integrate the FreeToGame public API as a proxy web service to display latest free-to-play game releases.
- To connect the front-end to the back-end web services running on a separate server.
- To produce a deployable and testable project with proper documentation and README instructions.

## 1.3 Scope of the System

The system supports two main user groups:

### General Users
- Access the home page with a featured game banner, carousels (Games on Sale, New Releases, Free Games, Most Popular), and a news section powered by FreeToGame API
- Search for games using multiple filter criteria (title, genre, price range, pricing type)
- View detailed game information including image gallery, description, system requirements, and user ratings/reviews
- Submit reviews and ratings for games
- Add games to a session-based shopping cart with quantity management
- Save games to a session-based wishlist and move them to cart
- Register a customer account and log in
- Access team member information with social links

### Administrators
- Log in using the administrator login page
- Add new games via a modal form with genre checkboxes, pricing type selection, gallery image URLs
- Update existing games inline from the inventory table
- Delete games with confirmation dialog

## 1.4 Technologies Used

| Component           | Technology Used                              |
|---------------------|----------------------------------------------|
| Front-end           | HTML5, CSS3, Vanilla JavaScript              |
| Front-end Server    | Node.js, Express.js (static file serving with clean URL routing) |
| Back-end            | Node.js, Express.js                          |
| Database            | MySQL (accessed via mysql2/promise)           |
| Authentication      | bcryptjs (password hashing)                  |
| Web Service Testing | Postman                                      |
| Public Web Service  | FreeToGame API (free, no API key required)   |
| Environment Config  | dotenv                                       |
| Cross-Origin        | cors middleware                              |

## 1.5 Team Responsibilities

| Member                  | Student ID | Main Responsibilities                    |
|-------------------------|------------|------------------------------------------|
| Promdpoori Athipornwanit| 6788004    | Frontend Developer                       |
| Numning Sungkagul       | 6788121    | Backend Developer                        |
| Kasidech Thongpakdee    | 6788134    | Database Designer                        |
| Nannalin Leelaparung    | 6788181    | UI/UX Designer                           |


---

# 2. Navigation Diagram

## 2.1 Sitemap / Navigation Structure

```
                        ┌─────────────┐
                        │  Home Page  │
                        │   /home     │
                        └──────┬──────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
   │ Browse Games │     │  Team Page  │     │ Admin Login │
   │   /games     │     │   /team     │     │/admin/login │
   └──────┬──────┘     └─────────────┘     └──────┬──────┘
          │                                        │
   ┌──────▼──────┐                          ┌──────▼──────┐
   │ Game Detail  │                          │   Admin     │
   │ /game?id=X   │                          │  Dashboard  │
   └──────┬──────┘                          │   /admin    │
          │                                 └─────────────┘
   ┌──────┴──────────┐
   │                  │
┌──▼──────┐   ┌──────▼────┐
│  Cart   │   │  Wishlist  │
│  /cart  │   │ /wishlist  │
└─────────┘   └───────────┘

   ┌──────────────┐
   │ User Account │  (accessible from any page via navbar)
   │  /account    │
   └──────────────┘
```

Figure 1. Navigation Diagram of the Web Application

## 2.2 Navigation Explanation

- The **Home Page** (/home) acts as the main entry point. It features a featured game banner, four carousel sections (Games on Sale, New Releases, Free Games, Most Popular), and a news section showing latest free-to-play game releases from FreeToGame API. A left sidebar provides genre-based navigation links.
- All pages share a consistent **navigation bar** with links to: Home, Games, Team, Wishlist (♡), Cart (🛒 with badge count), Account (👤), and Admin.
- From the **Browse Games** page (/games), users can apply multiple filters (title, genre, price range) and click on any game card to navigate to its **Detail Page** (/game?id=X).
- The **Detail Page** displays full game information with an image gallery slider, tabbed content (Description, System Requirements, User Ratings), a review submission form, and wishlist/cart buttons.
- The **Cart Page** (/cart) shows cart items with quantity controls, pricing calculations (subtotal, discount, total), and checkout/clear buttons.
- The **Wishlist Page** (/wishlist) shows saved games with options to remove or move to cart.
- Users can access the **User Account** page (/account) from the navigation bar, which provides tabbed Sign In and Create Account forms.
- Administrators access the **Admin Login** (/admin/login) page, and upon successful authentication are redirected to the **Admin Dashboard** (/admin), which features a data table with edit/delete actions and a modal form for adding/editing games.
- Every page contains a **footer** with quick links and social media connections.


---

# 3. Details of Web Application and Code

## 3.1 Front-end Overview

The front-end was implemented using HTML5, CSS3, and JavaScript. It is hosted on a separate Express server (port 5500) with clean URL routing. All pages include a navigation bar and footer, use semantic HTML elements, and connect to the back-end API at http://localhost:3000/api. The front-end source is located in the `sec2_gr12_fe_src/` directory and consists of 9 HTML pages, 1 CSS file (css/style.css), and 9 JavaScript files in the js/ directory.

## 3.2 Home Page

### Purpose
The Home Page (index.html, served at /home) serves as the main landing page for GameHub. It showcases featured games, organizes content into browsable sections, and integrates the FreeToGame public API.

### Implemented Features
- Left sidebar with genre navigation links (Action, RPG, Strategy, Simulation, etc.)
- Featured game banner showing the most expensive game with "Buy Now" and wishlist buttons
- Games on Sale carousel with discount badges and sale prices
- New Releases horizontal slider sorted by release date
- Free Games section combining "Free" and "100% Sale" games
- Most Popular games slider with ranked cards
- New Game Releases section powered by FreeToGame public API (free-to-play game data)
- Navigation bar search input (Enter key redirects to /games with query)
- Dynamic cart badge showing item count

### Code Explanation
The page uses semantic HTML: `<header>` wraps the navigation bar, `<aside>` contains the genre sidebar, `<main>` wraps all content sections, `<section>` groups each carousel/content block, and `<footer>` provides site-wide links. JavaScript (js/home.js) fetches game data via parallel API calls (`Promise.all`) to `/api/games`, `/api/games?pricingType=Sale`, and `/api/games?pricingType=Free`, then renders each section dynamically. The FreeToGame integration calls `/api/news` (backend proxy) and renders the 9 most recent releases as news cards.

## 3.3 Administrator Login Page

### Purpose
The Administrator Login Page (login.html, served at /admin/login) allows administrators to enter credentials to access the game management dashboard.

### Implemented Features
- Username input field with placeholder text
- Password input field
- "Sign In" submit button with loading state feedback ("Signing in...")
- Error message display area for failed login attempts
- GameHub branding logo
- Full navigation bar and footer

### Code Explanation
The login form is structured as `<form id="login-form">` inside `<section class="auth-container">`. JavaScript (js/login.js) checks if admin is already logged in via `localStorage.getItem('adminUser')` and redirects to /admin if so. On form submission, the script sends a POST request to `/api/auth/login` with `{ username, password }`. On success, admin info is saved to localStorage and the user is redirected to /admin. On failure, the error message is displayed.

## 3.4 Search Page

### Purpose
The Search Page (search.html, served at /games) allows users to browse and search for games based on multiple criteria with real-time filtering.

### Implemented Features
- Text search input for game title
- Dropdown filter for genre (RPG, Action, MMORPG, Racing, Puzzle, Strategy, etc.)
- Dropdown filter for price range (Under ฿500, ฿500–฿1,000, ฿1,000–฿2,000, ฿2,000+)
- Search button and Clear Filters button
- Result count display
- Game result cards with images, genre labels, pricing (regular/sale/free), and links to detail page
- URL parameter support for direct linking (e.g., from homepage genre sidebar links)

### Search Criteria Used
1. **Game Title** — partial text match (sent as `?title=` query parameter)
2. **Genre** — exact match from dropdown (sent as `?genre=`)
3. **Price Range** — min/max values from dropdown (sent as `?minPrice=` and `?maxPrice=`)

### Code Explanation
The search functionality is in js/search.js. On page load, it checks URL parameters for initial filters (supporting direct links from homepage genre sidebar). The `loadGames()` function collects values from all filter inputs, constructs query parameters, and calls `GET /api/games?...`. Results are rendered as a grid of clickable cards, each linking to `/game?id=X`.

## 3.5 Detail Page

### Purpose
The Detail Page (detail.html, served at /game?id=X) displays comprehensive information about a single game including gallery, specs, reviews, and interactive features.

### Implemented Features
- Dynamic game loading based on URL parameter (?id=...)
- Image gallery with slider navigation (prev/next arrows) and thumbnail strip
- Genre badge chips
- Pricing display with sale/free logic
- Tabbed content: Description, System Requirements, User Ratings
- Rating statistics with star display and 5-star distribution bar chart
- User review listing sorted by newest
- Review submission form (name, rating 1-5, comment)
- Wishlist toggle button (Add/Remove)
- Add to Cart button with success feedback
- "Back to Search Results" navigation link

### Code Explanation
js/detail.js extracts the game ID from URL, then makes parallel API calls to `/api/games/:id`, `/api/reviews/:id`, and `/api/reviews/stats/:id`. It also checks wishlist status via `/api/wishlist/check/:sessionId/:gameId`. The image gallery uses a slider with `updateSlider()` function for navigation. Tab switching is handled by `setupTabs()`. Review submission sends POST to `/api/reviews`. Wishlist toggle sends POST or DELETE to `/api/wishlist`.

## 3.6 Product/Service Management Page (Admin Dashboard)

### Purpose
The Admin Dashboard (admin.html, served at /admin) allows authenticated administrators to manage the game catalog with full CRUD operations.

### Implemented Features
- Auth guard: redirects to /admin/login if not logged in
- Sidebar navigation with links to Dashboard, Home, Browse Games, Team, and Logout
- Welcome message with admin name
- "Add New Game" button opening a modal form
- Data table listing all games with columns: ID, Game (image + title), Genre, Price, Type (pricing badge), Release Date, Actions (Edit/Delete)
- Modal form for adding/editing games with fields: Title, Genres (28 checkbox options), Price, Pricing Type (Regular/Sale/Free), Sale Discount %, Description, Release Date, Main Image URL, Gallery Images (dynamic URL inputs)
- Delete confirmation dialog

### Code Explanation
js/admin.js checks authentication on load, then fetches all games via `GET /api/games` to populate the data table. The `openModal()` function handles both add and edit modes — in edit mode it pre-fills all form fields including genre checkboxes and gallery URLs. Form submission sends POST `/api/games` for new games or PUT `/api/games/:id` for updates. Delete calls DELETE `/api/games/:id`. Genre selection uses 28 checkboxes rendered from the `AVAILABLE_GENRES` array. Gallery images use dynamically added/removed URL input rows.

## 3.7 Team Page

### Purpose
The Team Page (team.html, served at /team) presents the four team members with avatar images, student IDs, roles, and social links.

### Implemented Features
- Four team member cards in a responsive grid layout
- Each card includes: avatar image (from DiceBear API), full name, student ID, role title, and a GitHub social link
- Consistent navigation bar and footer

### Team Members Displayed

| Name                   | Student ID | Role               |
|------------------------|------------|---------------------|
| Promdpoori Athipornwanit| 6788004   | Frontend Developer  |
| Numning Sungkagul      | 6788121    | Backend Developer   |
| Kasidech Thongpakdee   | 6788134    | Database Designer   |
| Nannalin Leelaparung   | 6788181    | UI/UX Designer      |

## 3.8 Additional Pages

### 3.8.1 Shopping Cart Page (cart.html)
Implements a session-based shopping cart. Displays cart items with images, titles, prices (handling sale/free logic), quantity inputs, and remove buttons. Shows an Order Summary sidebar with subtotal, discount, and total calculations. Includes "Proceed to Checkout" and "Clear Cart" buttons. JavaScript (js/cart.js) manages the cart via API calls to GET/POST/PUT/DELETE `/api/cart/...`.

### 3.8.2 Wishlist Page (wishlist.html)
Displays saved games in a card grid with remove buttons and "Add to Cart" buttons. JavaScript (js/wishlist.js) fetches wishlisted games via GET `/api/wishlist/:sessionId` and supports removing (DELETE) and moving items to cart (POST `/api/cart`).

### 3.8.3 User Login/Register Page (user-login.html)
A tab-based authentication page with "Sign In" and "Create Account" tabs. The login form sends POST `/api/users/login` and the registration form sends POST `/api/users/register` with firstName, lastName, username, email, and password. On success, session is stored in localStorage. JavaScript (js/user-login.js) handles tab switching and both form submissions.

## 3.9 Semantic Elements Used

- `<header>` — wraps the site header containing the navigation bar on every page
- `<nav>` — contains the primary navigation links
- `<main>` — wraps the primary content area of each page
- `<section>` — groups related content blocks (carousels, search results, forms)
- `<aside>` — used for sidebar navigation (homepage genre list, cart summary)
- `<footer>` — provides consistent site-wide footer with brand, links, and social
- `<form>` — used for login, registration, search, review, and game management forms
- `<label>` — associated with all form input fields

## 3.10 CSS Implementation

The project uses one external CSS file: **css/style.css** (~64KB, ~1800+ lines).

The CSS design uses:
- **CSS Custom Properties** (variables) for theming: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--accent-primary`, `--border-color`, etc.
- **Dark theme** design with consistent color palette throughout
- **Element selectors**: body, header, nav, main, footer, h1–h3, p, a, input, button, table
- **Class selectors**: `.navbar`, `.logo`, `.nav-links`, `.carousel-card`, `.card`, `.card-body`, `.card-title`, `.card-price`, `.sale-badge`, `.btn`, `.btn-primary`, `.form-control`, `.modal`, `.data-table`, `.team-card`, `.footer`, `.auth-card`
- **ID selectors**: `#featured-banner`, `#sale-track`, `#new-track`, `#results-grid`, `#cart-items`, `#game-modal`, `#login-form`
- **Responsive layout** using CSS Grid and Flexbox
- **Smooth transitions** and hover effects on cards, buttons, and navigation elements

## 3.11 Code Structure and Comments

Every JavaScript file begins with a JSDoc block comment header describing the module purpose and features. Every function has a JSDoc comment with `@param` and `@returns` tags. Inline comments explain key logic decisions.

Example from js/home.js:
```
/**
 * home.js — Home Page Logic
 *
 * Fetches game data from the backend API and renders the homepage sections:
 * 1. Featured game banner (most expensive game)
 * 2. Games on Sale carousel
 * 3. New Releases horizontal slider
 * 4. Free Games horizontal slider
 * 5. Most Popular games slider
 *
 * Also integrates the FreeToGame public API to show gaming news.
 */
```

### Directory Structure

```
WebDev_Phase2/
├── sec2_gr12_fe_src/
│   ├── server.js           # Express server with clean URL routing (port 5500)
│   ├── package.json        # Frontend dependencies (express)
│   ├── index.html          # Home page
│   ├── search.html         # Browse/Search games
│   ├── detail.html         # Game detail
│   ├── cart.html           # Shopping cart
│   ├── wishlist.html       # Wishlist
│   ├── user-login.html     # User sign in / register
│   ├── team.html           # Team members
│   ├── login.html          # Admin login
│   ├── admin.html          # Admin dashboard
│   ├── css/
│   │   └── style.css       # Global stylesheet (~64KB)
│   └── js/
│       ├── home.js          # Homepage carousels + news API
│       ├── search.js        # Multi-criteria search
│       ├── detail.js        # Game detail, gallery, reviews
│       ├── cart.js          # Cart management
│       ├── wishlist.js      # Wishlist management
│       ├── admin.js         # Admin CRUD dashboard
│       ├── login.js         # Admin login handler
│       ├── user-login.js    # User register/login
│       └── team.js          # Team member rendering
├── sec2_gr12_ws_src/
│   ├── server.js            # Express API entry point (port 3000)
│   ├── config/
│   │   └── db.js            # MySQL connection pool + database initialization
│   ├── sec2_gr12_database.sql  # 10 tables + seed data
│   ├── package.json         # Backend dependencies
│   └── routes/
│       ├── games.js         # Game CRUD + search (6 endpoints)
│       ├── auth.js          # Admin login (1 endpoint)
│       ├── reviews.js       # Reviews CRUD + stats (4 endpoints)
│       ├── cart.js          # Cart management (6 endpoints)
│       ├── wishlist.js      # Wishlist management (4 endpoints)
│       ├── users.js         # User auth (3 endpoints)
│       └── news.js          # FreeToGame API proxy (1 endpoint)
├── README.md
└── .gitignore
```
