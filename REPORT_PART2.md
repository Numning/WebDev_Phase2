# 4. Details of Web Services and Code

## 4.1 Back-end Overview

The back-end was implemented using Node.js with the Express.js framework and connects to a MySQL database using the mysql2/promise library. It provides RESTful JSON web services for administrator authentication, game search and detail viewing, full game CRUD management, customer account registration and login, session-based cart management, session-based wishlist management, game review submission and statistics, and a FreeToGame public API proxy. The server entry point is sec2_gr12_ws_src/server.js, which mounts seven route modules under the /api prefix.

## 4.2 Database Overview

### Database Purpose
The database (game_store) stores all persistent data for the GameHub platform including administrator accounts and login credentials, game catalog data with pricing and images, genre categories and game-genre mappings, user-submitted reviews, session-based wishlists, session-based shopping carts, and customer user accounts.

### Main Tables

| Table Name    | Description                                | Key Columns                                      |
|---------------|--------------------------------------------|--------------------------------------------------|
| Administrator | Admin user profile information (10 records)| AdminID, FirstName, LastName, Email               |
| AdminLogin    | Login credentials with bcrypt hash (10 records)| LoginID, AdminID, Username, Password, Role, LastLoginLog|
| Game          | Game catalog with local image paths (24 records)| GameID, Title, Price, PricingType, SalePercent, Description, ReleaseDate, ImageUrl, GalleryImages |
| Genre         | Game genre categories (28 genres)          | GenreID, Name                                    |
| GameGenre     | Many-to-many game-genre junction table (72 records) | GameID, GenreID                           |
| Review        | User-submitted game reviews — 41 reviews   | ReviewID, GameID, ReviewerName, Rating, Comment, CreatedAt |
| Wishlist      | Session-based game wishlist (10 records)   | WishlistID, GameID, SessionID, AddedAt           |
| AdminAddGame  | Tracks which admin added which game (24 records)| AdminID, GameID, AddedAt                    |
| User          | Customer accounts with bcrypt passwords (10 records) | UserID, Username, Email, Password, FirstName, LastName, CreatedAt |
| Cart          | Session-based cart — **1 game per session** (10 records) | CartID, GameID, SessionID, Quantity, AddedAt |

## 4.3 Authentication Service

### Purpose
Authenticates administrators during login using bcrypt password comparison.

### Endpoint
POST /api/auth/login

### Input
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Output (Success - 200)
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "username": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@gamehub.com",
    "role": "super_admin"
  }
}
```

### Output (Failure - 401)
```json
{
  "error": "Invalid username or password"
}
```

### Logic Explanation
1. **Input validation**: Checks that both username and password are provided. Returns 400 if missing.
2. **Database query**: Executes a JOIN query on AdminLogin and Administrator tables using parameterized query to prevent SQL injection.
3. **Username check**: If no rows returned, returns 401 with generic error message.
4. **Password comparison**: Uses `bcrypt.compare()` to compare provided password against stored bcrypt hash. On mismatch, returns 401.
5. **Success**: Updates `LastLoginLog` timestamp and returns the admin profile object.

### Code Snippet
```javascript
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const [rows] = await pool.query(
        `SELECT al.*, a.FirstName, a.LastName, a.Email
         FROM AdminLogin al JOIN Administrator a ON al.AdminID = a.AdminID
         WHERE al.Username = ?`, [username]
    );
    if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.Password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    await pool.query('UPDATE AdminLogin SET LastLoginLog = NOW() WHERE LoginID = ?', [admin.LoginID]);
    res.json({ success: true, admin: { id: admin.AdminID, username: admin.Username, ... } });
});
```

## 4.4 Search Service

### Purpose
Returns games based on zero or multiple search criteria with support for filtering and sorting.

### Endpoint
GET /api/games

### Supported Search Modes
- **No criteria search** — returns all games (default sort: newest first by ReleaseDate DESC)
- **Criteria search** — supports up to five filter parameters combined freely

### Criteria Used
1. **title** — Partial match on game title using SQL LIKE (`?title=Elden`)
2. **genre** — Exact match on genre name via JOIN with Genre/GameGenre tables (`?genre=RPG`)
3. **minPrice** — Minimum price filter (`?minPrice=0`)
4. **maxPrice** — Maximum price filter (`?maxPrice=500`)
5. **pricingType** — Exact match: Regular, Sale, or Free (`?pricingType=Sale`)

### Example Request
```
GET /api/games?title=Elden&genre=RPG&minPrice=0&maxPrice=2000
```

### Example Response
```json
[
  {
    "GameID": 1,
    "Title": "Elden Ring",
    "Price": 1790.00,
    "PricingType": "Regular",
    "SalePercent": 0,
    "Description": "An epic action RPG...",
    "ReleaseDate": "2024-02-25",
    "ImageUrl": "https://...",
    "GalleryImages": "",
    "Genres": ["RPG", "Action", "Open World"]
  }
]
```

## 4.5 Detail Service

### Purpose
Returns the complete record for a single game including all fields and attached genre names.

### Endpoint
GET /api/games/:id

### Logic Explanation
The endpoint receives the game ID as a URL parameter. It executes `SELECT * FROM Game WHERE GameID = ?`. If found, the `attachGenres()` helper function queries the GameGenre and Genre tables to attach a `Genres` array. If no row matches, a 404 response is returned.

### Example Request
```
GET /api/games/1
```

### Example Response (200)
```json
{
  "GameID": 1,
  "Title": "Elden Ring",
  "Price": 1790.00,
  "PricingType": "Regular",
  "SalePercent": 0,
  "Description": "An epic action RPG...",
  "ReleaseDate": "2024-02-25",
  "ImageUrl": "https://...",
  "GalleryImages": "",
  "Genres": ["RPG", "Action", "Open World"]
}
```

## 4.6 Insert Service

### Purpose
Allows administrators to create a new game record in the database through the admin dashboard.

### Endpoint
POST /api/games

### Example Input
```json
{
  "title": "Test Game",
  "genres": ["Action", "RPG"],
  "price": 999,
  "pricingType": "Regular",
  "salePercent": 0,
  "description": "A test game for Postman.",
  "releaseDate": "2026-01-01",
  "imageUrl": "https://via.placeholder.com/300",
  "galleryImages": ""
}
```

### Logic Explanation
The service receives game data as JSON body. It inserts a new row into the Game table with parameterized values. Then the `syncGameGenres()` helper function processes the genres array — for each genre name, it finds or creates the genre in the Genre table, then inserts a mapping row in GameGenre. On success, the newly created game is re-fetched with genres attached and returned with 201 status.

## 4.7 Update Service

### Purpose
Allows administrators to update existing game data and re-sync genre associations.

### Endpoint
PUT /api/games/:id

### Example Input
```json
{
  "title": "Updated Game Title",
  "genres": ["Action"],
  "price": 1299,
  "pricingType": "Sale",
  "salePercent": 25,
  "description": "Updated description.",
  "releaseDate": "2026-01-01",
  "imageUrl": "https://via.placeholder.com/300",
  "galleryImages": ""
}
```

### Logic Explanation
The service receives the game ID as URL parameter and updated fields as JSON body. It executes an UPDATE statement with all fields. If `affectedRows === 0`, returns 404. Then `syncGameGenres()` deletes existing genre mappings and inserts new ones. The updated game is re-fetched with genres and returned.

## 4.8 Delete Service

### Purpose
Allows administrators to delete a game from the catalog.

### Endpoint
DELETE /api/games/:id

### Example Response (200)
```json
{ "message": "Game deleted successfully" }
```

### Example Response (404)
```json
{ "error": "Game not found" }
```

### Logic Explanation
Executes `DELETE FROM Game WHERE GameID = ?`. If `affectedRows > 0`, returns success. If zero rows affected, returns 404. Associated data (genres, reviews, wishlist entries) is removed via CASCADE foreign keys.

## 4.9 Public Web Service Integration

### Public API Used
**FreeToGame API** (https://www.freetogame.com/api-doc) — completely free, no API key required.

### Purpose
Displays the latest free-to-play game releases on the GameHub homepage, demonstrating integration with an external public web service.

### How It Was Integrated
- **Backend proxy**: The route `GET /api/news` in routes/news.js fetches data from `https://www.freetogame.com/api/games?sort-by=release-date&platform=all` using Node.js built-in `https` module.
- **Data formatting**: The backend takes the 9 most recent games and formats them as "news articles" with title, description, URL, image, publisher, release date, genre, and platform fields.
- **Frontend rendering**: js/home.js calls `/api/news` and renders the articles as a card grid in the "New Game Releases" section. The first card is featured (larger), remaining cards are standard size.
- **No API key**: This API requires no authentication, making deployment simple with no configuration needed.
- **Error handling**: If the API is unreachable or returns no data, the news section is hidden gracefully.

## 4.10 Back-end Source Code Structure

```
sec2_gr12_ws_src/
├── server.js           # Express app entry point (middleware, route mounting)
├── config/
│   └── db.js           # MySQL connection pool + database initialization
├── sec2_gr12_database.sql  # 10 tables + seed data (19 games, genres, admins, reviews)
├── package.json        # Dependencies: express, mysql2, cors, dotenv, bcryptjs
├── .env                # Environment variables (edit with your MySQL credentials)
└── routes/
    ├── games.js        # GET/POST/PUT/DELETE /api/games (CRUD + search)
    ├── auth.js         # POST /api/auth/login (admin authentication)
    ├── reviews.js      # GET/POST/DELETE /api/reviews (reviews + stats)
    ├── cart.js         # GET/POST/PUT/DELETE /api/cart (cart management)
    ├── wishlist.js     # GET/POST/DELETE /api/wishlist (wishlist management)
    ├── users.js        # POST register/login, GET profile
    └── news.js         # GET /api/news (FreeToGame API proxy)
```

## 4.11 Comments in Source Code

Comments were added throughout both front-end and back-end source code. Each backend route file begins with a comprehensive JSDoc block comment that includes the module name, description, all endpoints, and numbered Postman test cases with method, URL, body, and expected response.

For example, routes/games.js includes 10 test cases documented above the route definitions, covering listing without criteria, searching by title, genre, price range, inserting new games (regular and free), updating games (valid and invalid ID), and deleting games (valid and invalid ID).


---

# 5. Web Service Testing Results

## 5.1 Testing Tool
The web services were tested using **Postman**. Test case specifications are documented in the source code comments of each route file.

## 5.2 Authentication Service Testing

### Test Case 1: Valid Login (Successful Authentication)
- Method: POST
- URL: http://localhost:3000/api/auth/login
- Input: `{ "username": "admin", "password": "admin123" }`
- Expected: 200 — `{ "success": true, "admin": { "id": 1, "username": "admin", ... } }`

### Test Case 2: Invalid Login (Wrong Password)
- Method: POST
- URL: http://localhost:3000/api/auth/login
- Input: `{ "username": "admin", "password": "wrongpassword" }`
- Expected: 401 — `{ "error": "Invalid username or password" }`

## 5.3 Search Service Testing

### Test Case 1: No Criteria Search (List All)
- Method: GET
- URL: http://localhost:3000/api/games
- Expected: 200 — Array of all games

### Test Case 2: Search by Title
- Method: GET
- URL: http://localhost:3000/api/games?title=Elden
- Expected: 200 — Array containing games matching "Elden"

### Test Case 3: Search by Genre
- Method: GET
- URL: http://localhost:3000/api/games?genre=RPG
- Expected: 200 — Array of RPG games only

### Test Case 4: Search by Price Range
- Method: GET
- URL: http://localhost:3000/api/games?minPrice=0&maxPrice=500
- Expected: 200 — Array of games priced between 0 and 500

## 5.4 Detail Service Testing

### Test Case 1: Valid Game ID
- Method: GET
- URL: http://localhost:3000/api/games/1
- Expected: 200 — Full game object with Genres array

### Test Case 2: Invalid Game ID
- Method: GET
- URL: http://localhost:3000/api/games/99999
- Expected: 404 — `{ "error": "Game not found" }`

## 5.5 Insert Service Testing

### Test Case 1: Valid Insert
- Method: POST
- URL: http://localhost:3000/api/games
- Input: `{ "title": "Test Game", "genres": ["Action", "RPG"], "price": 999, "pricingType": "Regular", "salePercent": 0, "description": "A test game.", "releaseDate": "2026-01-01", "imageUrl": "", "galleryImages": "" }`
- Expected: 201 — Created game object with GameID and Genres

### Test Case 2: Insert Free Game
- Method: POST
- URL: http://localhost:3000/api/games
- Input: `{ "title": "Free Test", "genres": ["Casual"], "price": 0, "pricingType": "Free", "salePercent": 0, "description": "Free game.", "releaseDate": "2026-03-15", "imageUrl": "", "galleryImages": "" }`
- Expected: 201 — Created free game object

## 5.6 Update Service Testing

### Test Case 1: Valid Update
- Method: PUT
- URL: http://localhost:3000/api/games/1
- Input: `{ "title": "Updated Title", "genres": ["Action"], "price": 1299, "pricingType": "Sale", "salePercent": 25, "description": "Updated.", "releaseDate": "2026-01-01", "imageUrl": "", "galleryImages": "" }`
- Expected: 200 — Updated game object

### Test Case 2: Invalid ID
- Method: PUT
- URL: http://localhost:3000/api/games/99999
- Input: `{ "title": "Ghost", "genres": [], "price": 0, ... }`
- Expected: 404 — `{ "error": "Game not found" }`

## 5.7 Delete Service Testing

### Test Case 1: Valid Delete
- Method: DELETE
- URL: http://localhost:3000/api/games/1
- Expected: 200 — `{ "message": "Game deleted successfully" }`

### Test Case 2: Invalid ID
- Method: DELETE
- URL: http://localhost:3000/api/games/99999
- Expected: 404 — `{ "error": "Game not found" }`

## 5.8 Summary of Test Results

| Service        | Test Case 1 (Valid)       | Test Case 2 (Invalid)      |
|----------------|---------------------------|----------------------------|
| Authentication | Valid login → 200 success | Wrong password → 401 fail  |
| Search         | No criteria → all results | By genre → filtered set    |
| Detail         | Valid ID → 200 game       | Invalid ID → 404 not found |
| Insert         | Valid body → 201 created  | Free game → 201 created    |
| Update         | Valid update → 200        | Invalid ID → 404 not found |
| Delete         | Valid delete → 200        | Invalid ID → 404 not found |

> **Note:** Insert screenshots of each Postman test result in your final report PDF.


---

# 6. Additional Requirements Compliance

## 6.1 Front-end and Back-end on Different Servers
- Front-end server runs on: http://localhost:5500 (Node.js Express static server)
- Back-end server runs on: http://localhost:3000 (Node.js Express API server)
- CORS middleware is enabled in the backend server.js to allow cross-origin requests.

## 6.2 Database Connection
The back-end connects to MySQL through a connection pool configured in config/db.js using the mysql2/promise library. Connection parameters are loaded from environment variables in the .env file:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_store
```
The pool is configured with `connectionLimit: 10`, `waitForConnections: true`, and `queueLimit: 0`.

## 6.3 Deployment Readiness
The project can be run on lecturer/LA machines with:
- Required software: Node.js 14+, MySQL server
- Database auto-creation: The backend automatically creates the database and tables on first run via config/db.js
- No manual SQL import needed — sec2_gr12_database.sql is executed automatically if tables don't exist

## 6.4 README.md
The repository includes a comprehensive README.md with project structure, prerequisites, step-by-step setup instructions, page listing, API endpoint reference, database table listing, tech stack, and default admin credentials.

## 6.5 File Naming and Submission Format
- Frontend source: sec2_gr12_fe_src/ directory
- Backend source: sec2_gr12_ws_src/ directory
- Database schema: sec2_gr12_ws_src/sec2_gr12_database.sql


---

# 7. Deployment and Run Instructions Summary

## 7.1 Steps to Run the Back-end
1. Navigate to the backend folder: `cd sec2_gr12_ws_src`
2. Edit `.env` with your MySQL credentials (update `DB_PASSWORD`)
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. The server automatically creates the database and tables on first run
6. Verify at http://localhost:3000

## 7.2 Steps to Run the Front-end
1. Open a new terminal
2. Navigate to the frontend folder: `cd sec2_gr12_fe_src`
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Access at http://localhost:5500

## 7.3 Database
- The database is created automatically when the backend starts for the first time
- No manual SQL import is required
- Schema file location: sec2_gr12_ws_src/sec2_gr12_database.sql (10 tables + seed data)


---

# 8. Conclusion

This project successfully implemented a full-stack web application for the gaming e-commerce domain using HTML5, CSS3, JavaScript, Node.js with Express.js, and MySQL. The GameHub platform enables users to browse, search, and explore a catalog of games with rich detail pages featuring **locally hosted images**, manage shopping carts (1 copy per game) and wishlists, submit reviews, and create customer accounts.

The system includes 9 front-end pages with consistent navigation, a **CSS mask-image SVG icon system**, and a dark-themed responsive design. The key features include: administrator authentication with bcrypt password hashing, multi-criteria game search, detailed game viewing with **local image gallery slider** and tabbed content, full CRUD game management, a review system with ratings and star-distribution statistics, session-based cart with 1-per-game enforcement and wishlist, customer registration and login, real team profile photos, and integration with the FreeToGame public API.

The back-end provides 25 RESTful API endpoints across seven route modules (games, auth, reviews, cart, wishlist, users, news), connected to a MySQL database with **10 relational tables** each containing **10+ seed records**: 24 games, 28 genres, 10 administrators, 10 admin logins, 10 users, 41 reviews, 10 wishlist entries, 10 cart entries, and 72 genre mappings. All web services are documented with inline Postman test cases.

Through this project, the team gained practical experience in full-stack web development, database design, RESTful API development, front-end and back-end integration on separate servers, local static asset management, public API consumption, and systematic testing methodology.


---

# 9. Appendix

## Appendix A: Database Tables / Sample Records
- **Administrator** — 10 admin accounts (Admin User + 7 managers + 2 moderators)
- **AdminLogin** — 10 login credentials (bcrypt hashed, roles: super_admin / manager / moderator)
- **Game** — **24 game products** with full details and **locally hosted images** (`/images/games/<folder>/front.jpg`)
- **Genre** — 28 genre categories (Action, RPG, Strategy, Simulation, Fantasy, etc.)
- **GameGenre** — 72 many-to-many mappings
- **Review** — **41 user reviews** with ratings across 23 games
- **Wishlist** — 10 session-based entries
- **Cart** — 10 session-based cart items (1 copy per game rule enforced)
- **User** — 10 customer accounts
- **AdminAddGame** — 24 admin-game tracking records

## Appendix B: Local Image System
Game images are served by the frontend Express server from the `images/` directory:
- **Cover image**: `/images/games/<GameFolder>/front.jpg` — used for cards and gallery main slot
- **Gallery images**: `/images/games/<GameFolder>/detail_1.jpg`, `detail_2.jpg`, ... `detail_N.jpg` — used in the slider
- **Team photos**: `/images/team/<studentId>.jpg` — displayed on the team page

The `server.js` serves these via: `app.use('/images', express.static(path.join(__dirname, 'images')))`

## Appendix B: Key Code Snippets
1. Admin Login Route (sec2_gr12_ws_src/routes/auth.js) — Login with bcrypt comparison
2. Game Search Route (sec2_gr12_ws_src/routes/games.js) — Multi-criteria search with dynamic SQL
3. Game CRUD Routes (sec2_gr12_ws_src/routes/games.js) — Insert, Update, Delete with genre sync
4. FreeToGame Proxy (sec2_gr12_ws_src/routes/news.js) — Public API integration
5. Home Page Script (sec2_gr12_fe_src/js/home.js) — Parallel API fetching and carousel rendering
6. Detail Page Script (sec2_gr12_fe_src/js/detail.js) — Gallery slider, reviews, wishlist toggle
7. Database Config (sec2_gr12_ws_src/config/db.js) — MySQL connection pool + initialization


---

## References

- FreeToGame API Documentation. Accessed April 2026. https://www.freetogame.com/api-doc
- Express.js Documentation. Accessed April 2026. https://expressjs.com
- MySQL2 Documentation. Accessed April 2026. https://github.com/sidorares/node-mysql2
- bcryptjs Documentation. Accessed April 2026. https://github.com/dcodeIO/bcrypt.js


---

## AI Usage Acknowledgment Statement

**Group Name:** SEC X - GR Y

**Group Members:**
1. 6788004 Promdpoori Athipornwanit
2. 6788121 Numning Sungkagul
3. 6788134 Kasidech Thongpakdee
4. 6788181 Nannalin Leelaparung

Our group acknowledges that we have utilized Generative Artificial Intelligence tools for the project of this subject.

The AI tools that we used are: ChatGPT, Gemini

For the following purposes:
- Summarization
- Revising / Editing
- Code Assistance
- Other: Grammar Check
