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
 * Also integrates the CheapShark public API to show real game deals.
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
    setupNavSearch();
    updateCartBadge();
    loadPublicDeals(); // Public API integration (CheapShark)
});

/**
 * Fetches all games from the backend API and populates all homepage sections.
 * Makes parallel requests for all games, sale games, and free games.
 */
async function fetchGames() {
    try {
        // Fetch all games, sale games, and free games in parallel
        const [allRes, saleRes, freeRes] = await Promise.all([
            fetch(`${API_BASE}/games`),
            fetch(`${API_BASE}/games?pricingType=Sale`),
            fetch(`${API_BASE}/games?pricingType=Free`)
        ]);
        const allGames = await allRes.json();
        const saleGames = await saleRes.json();
        const freeGames = await freeRes.json();

        // 1. Featured game: most expensive game
        const sortedByPrice = [...allGames].sort((a, b) => b.Price - a.Price);
        const featured = sortedByPrice[0];
        if (featured) renderFeatured(featured);

        // 2. Games on Sale (Carousel) — only games marked as Sale by admin
        const saleSection = document.getElementById('sale-section');
        if (saleGames.length > 0) {
            renderCarousel(saleGames, 'sale-track');
            setupSlider('sale-prev', 'sale-next', 'sale-track', 300);
            saleSection.style.display = '';
        } else {
            saleSection.style.display = 'none';
        }

        // 3. New Releases (Horizontal Slider) — sort all games by date
        const sortedByDate = [...allGames].sort((a, b) => new Date(b.ReleaseDate) - new Date(a.ReleaseDate));
        const newReleases = sortedByDate.slice(0, 8);
        renderNewReleases(newReleases, 'new-track');
        setupSlider('new-prev', 'new-next', 'new-track', 350);

        // 4. Free Games (Horizontal Slider)
        // Combine manually set "Free" games AND "Sale 100%" games
        const freeToPlay = freeGames;
        const saleToFree = saleGames.filter(g => parseInt(g.SalePercent) === 100);
        
        // Merge and deduplicate by GameID
        const combinedFree = [...freeToPlay];
        saleToFree.forEach(g => {
            if (!combinedFree.find(f => f.GameID === g.GameID)) {
                combinedFree.push(g);
            }
        });

        const freeSection = document.getElementById('free-games-section');
        if (combinedFree.length > 0) {
            renderFreeGames(combinedFree, 'free-track');
            setupSlider('free-prev', 'free-next', 'free-track', 300);
            freeSection.style.display = '';
        } else {
            freeSection.style.display = 'none';
        }

        // 5. Most Popular (Slider) — random selection of 8 games
        const shuffled = [...allGames].sort(() => 0.5 - Math.random());
        const popular = shuffled.slice(0, 8);
        renderMostPopular(popular);
        setupSlider('popular-prev', 'popular-next', 'popular-grid', 320);

    } catch (err) {
        console.error('Failed to fetch games:', err);
    }
}

/**
 * Renders the featured game banner at the top of the homepage.
 * @param {Object} game - The game object to display as featured
 */
function renderFeatured(game) {
    const banner = document.getElementById('featured-banner');
    const imageUrl = game.ImageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=500&fit=crop';
    
    // Pricing logic — handle Free, 100% off, and regular pricing
    let priceDisplay = `฿${parseFloat(game.Price).toFixed(2)}`;
    if (game.PricingType === 'Free') {
        priceDisplay = 'FREE TO PLAY';
    } else if (game.PricingType === 'Sale' && parseInt(game.SalePercent) === 100) {
        priceDisplay = 'FREE (100% OFF)';
    }

    banner.innerHTML = `
        <img src="${imageUrl}" alt="${game.Title}"
             onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=500&fit=crop'">
        <div class="featured-overlay">
            <span class="featured-badge">NOW AVAILABLE</span>
            <h2 class="featured-title">${game.Title}</h2>
            <p class="featured-desc">${game.Description ? game.Description.substring(0, 160) + '...' : 'Experience the future of gaming.'}</p>
            <div class="featured-actions">
                <a href="detail.html?id=${game.GameID}" class="btn btn-white">BUY NOW — ${priceDisplay}</a>
                <button class="btn btn-secondary">+ to Wishlist</button>
            </div>
        </div>
    `;
    // Click on banner goes to game detail page
    banner.onclick = (e) => {
        if (!e.target.closest('.btn')) {
            window.location.href = `detail.html?id=${game.GameID}`;
        }
    };
}

/**
 * Renders the New Releases section as horizontal cards.
 * @param {Array} games - Array of game objects to display
 * @param {string} trackId - The DOM element ID of the carousel track
 */
function renderNewReleases(games, trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    track.innerHTML = games.map(game => {
        const thumb = game.ImageUrl || 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=400&h=250&fit=crop';
        
        // Build price display with sale logic
        let priceHtml = `฿${parseFloat(game.Price).toFixed(2)}`;
        if (game.PricingType === 'Free') {
            priceHtml = 'FREE';
        } else if (game.PricingType === 'Sale' && parseInt(game.SalePercent) === 100) {
             priceHtml = `<span style="text-decoration:line-through; font-size:0.8rem; margin-right:4px;">฿${parseFloat(game.Price).toFixed(2)}</span> FREE`;
        }

        return `
        <a href="detail.html?id=${game.GameID}" class="new-release-card">
            <img src="${thumb}" alt="${game.Title}" class="bg-img"
                 onerror="this.src='https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=400&h=250&fit=crop'">
            <div class="overlay">
                <div style="font-size:0.8rem; opacity:0.8; text-transform:uppercase; letter-spacing:1px;">${formatGenres(game.Genres)}</div>
                <div style="font-size:1.2rem; font-weight:700;">${game.Title}</div>
                <div style="margin-top:auto; font-weight:600;">${priceHtml}</div>
            </div>
        </a>`;
    }).join('');
}

/**
 * Renders the Free Games section as carousel cards.
 * @param {Array} games - Array of free game objects
 * @param {string} trackId - The DOM element ID of the carousel track
 */
function renderFreeGames(games, trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    track.innerHTML = games.map(game => {
        const thumb = game.ImageUrl || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=200&fit=crop';
        const originalPrice = parseFloat(game.Price).toFixed(2);
        
        let genreDisplay = 'Free to Play';
        let priceSection = '';

        // Differentiate between permanently free and limited-time free (100% sale)
        if (game.PricingType === 'Sale' && parseInt(game.SalePercent) === 100) {
            genreDisplay = 'Limited Time Free';
            priceSection = `
                <span class="sale-badge">100% OFF</span>
                <span class="original-price">฿${originalPrice}</span> ฿0.00
            `;
        } else {
            priceSection = `
                <span class="sale-badge" style="background:#00c853;">FREE</span>
                ฿0.00
            `;
        }

        return `
        <a href="detail.html?id=${game.GameID}" class="carousel-card">
            <img src="${thumb}" alt="${game.Title}"
                 onerror="this.src='https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=200&fit=crop'">
            <div class="card-body">
                <div class="card-title">${game.Title}</div>
                <div class="card-genre">${formatGenres(game.Genres)}</div>
                <div class="card-price">
                    ${priceSection}
                </div>
            </div>
        </a>`;
    }).join('');
}

/**
 * Renders the Games on Sale carousel with discount badges.
 * @param {Array} games - Array of sale game objects
 * @param {string} trackId - The DOM element ID of the carousel track
 */
function renderCarousel(games, trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    track.innerHTML = games.map(game => {
        const thumb = game.ImageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop';
        const price = parseFloat(game.Price);
        const disc = parseInt(game.SalePercent) || 0;
        let salePrice = disc > 0 ? (price * (1 - disc / 100)).toFixed(2) : null;
        
        // Handle 100% discount — price is free
        if (disc === 100) salePrice = "0.00";

        return `
        <a href="detail.html?id=${game.GameID}" class="carousel-card">
            <img src="${thumb}" alt="${game.Title}"
                 onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop'">
            <div class="card-body">
                <div class="card-title">${game.Title}</div>
                <div class="card-genre">${formatGenres(game.Genres)}</div>
                <div class="card-price">
                    ${disc > 0 ? `<span class="sale-badge">-${disc}%</span>` : ''}
                    ${salePrice ? `<span class="original-price">฿${price.toFixed(2)}</span> ฿${salePrice}` : `฿${price.toFixed(2)}`}
                </div>
            </div>
        </a>`;
    }).join('');
}

/**
 * Renders the Most Popular section as ranked cards.
 * @param {Array} games - Array of game objects to display
 */
function renderMostPopular(games) {
    const container = document.getElementById('popular-grid');

    container.innerHTML = games.map((game, i) => {
        const thumb = game.ImageUrl || 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=100&h=100&fit=crop';
        
        // Build price display
        let priceHtml = `฿${parseFloat(game.Price).toFixed(2)}`;
        if (game.PricingType === 'Free') {
             priceHtml = 'FREE';
        } else if (game.PricingType === 'Sale' && parseInt(game.SalePercent) === 100) {
             priceHtml = 'FREE';
        }

        return `
        <a href="detail.html?id=${game.GameID}" style="min-width: 300px; text-decoration: none; color: inherit; flex-shrink: 0;">
            <div class="popular-card" style="margin-bottom: 8px;">
                <div class="popular-rank">0${i + 1}</div>
                <img src="${thumb}" alt="${game.Title}" class="popular-thumb"
                     onerror="this.src='https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=100&h=100&fit=crop'">
                <div class="popular-info">
                    <span class="card-genre" style="margin-bottom:4px;">${formatGenres(game.Genres)}</span>
                    <h3>${game.Title}</h3>
                    <div class="popular-meta">
                        <span>★ 4.${9 - i}</span>
                    </div>
                </div>
            </div>
            <div style="text-align: right; font-weight: 700; font-size: 1.1rem; padding-right: 4px;">${priceHtml}</div>
        </a>
    `}).join('');
}

/**
 * Formats an array of genre names into a display string.
 * Shows at most 2 genres to avoid overflow on cards.
 * @param {Array} genres - Array of genre name strings
 * @returns {string} Formatted genre string like "RPG • Action"
 */
function formatGenres(genres) {
    if (!genres || !Array.isArray(genres) || genres.length === 0) return 'Unknown';
    return genres.slice(0, 2).join(' • ');
}

/**
 * Sets up horizontal slider navigation buttons for carousel sections.
 * @param {string} prevId - The DOM ID of the "previous" button
 * @param {string} nextId - The DOM ID of the "next" button
 * @param {string} trackId - The DOM ID of the scrollable track
 * @param {number} scrollAmount - Pixels to scroll per click
 */
function setupSlider(prevId, nextId, trackId, scrollAmount = 300) {
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    const track = document.getElementById(trackId);

    if (prev && next && track) {
        prev.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

/**
 * Sets up the navigation bar search input.
 * Pressing Enter redirects to the search page with the query as a URL parameter.
 */
function setupNavSearch() {
    const input = document.getElementById('nav-search-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                window.location.href = `search.html?title=${encodeURIComponent(input.value.trim())}`;
            }
        });
    }
}

/**
 * Loads real game deals from the CheapShark public API.
 * This fulfills the Task 4 requirement for public web service integration.
 * CheapShark is a free API that provides game deal data from multiple stores.
 * Displays deals in a dedicated section on the homepage.
 */
async function loadPublicDeals() {
    const section = document.getElementById('public-deals-section');
    const track = document.getElementById('deals-track');
    if (!section || !track) return;

    try {
        // CheapShark API — fetch top 10 deals sorted by deal rating
        const res = await fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&pageSize=10&sortBy=Deal%20Rating');
        const deals = await res.json();

        if (!deals || deals.length === 0) {
            section.style.display = 'none';
            return;
        }

        // Render deal cards from the public API data
        track.innerHTML = deals.map(deal => {
            const savings = Math.round(parseFloat(deal.savings));
            const salePrice = parseFloat(deal.salePrice).toFixed(2);
            const normalPrice = parseFloat(deal.normalPrice).toFixed(2);
            const thumb = deal.thumb || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop';

            return `
            <a href="https://www.cheapshark.com/redirect?dealID=${deal.dealID}" target="_blank" rel="noopener" class="carousel-card">
                <img src="${thumb}" alt="${deal.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop'">
                <div class="card-body">
                    <div class="card-title">${deal.title}</div>
                    <div class="card-genre">Steam Deal</div>
                    <div class="card-price">
                        ${savings > 0 ? `<span class="sale-badge">-${savings}%</span>` : ''}
                        <span class="original-price">$${normalPrice}</span> $${salePrice}
                    </div>
                </div>
            </a>`;
        }).join('');

        section.style.display = '';
        setupSlider('deals-prev', 'deals-next', 'deals-track', 300);
    } catch (err) {
        console.error('Failed to load CheapShark deals:', err);
        if (section) section.style.display = 'none';
        
    }
}

async function addToCart(gameId) {
    const sessionId = localStorage.getItem('sessionId');
    try {
        const res = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, sessionId })
        });
        if (res.ok) {
            updateCartBadge();
            alert('Added to cart!');
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
    }
}

async function updateCartBadge() {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    try {
        const res = await fetch(`${API_BASE}/cart/count/${sessionId}`);
        const data = await res.json();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => {
            b.textContent = data.count > 0 ? data.count : '';
            b.style.display = data.count > 0 ? 'inline-block' : 'none';
        });
    } catch(e) {}
}
