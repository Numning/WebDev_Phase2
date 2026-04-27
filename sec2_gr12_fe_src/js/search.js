/**
 * search.js —Game Search Page Logic
 * 
 * Handles the game search functionality with multiple criteria:
 * 1. Search by game title (text input)
 * 2. Search by genre (dropdown select)
 * 3. Search by price range (dropdown select)
 * 
 * Results are displayed on the same page as interactive cards
 * that link to the game detail page. Also supports URL parameters
 * for direct linking (e.g., from homepage genre sidebar).
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupNavSearch();

    // Handle search form submission
    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        loadGames();
    });

    // Handle clear filters button click
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('search-title').value = '';
        document.getElementById('search-genre').value = '';
        document.getElementById('search-price').value = '';
        loadGames();
    });
});

/**
 * Loads games from the backend API based on current filter values.
 * Builds a query string from the search criteria and fetches matching games.
 * Results are rendered as a grid of clickable game cards.
 */
async function loadGames() {
    const titleVal = document.getElementById('search-title').value.trim();
    const genre = document.getElementById('search-genre').value;
    const priceRange = document.getElementById('search-price').value;

    const params = new URLSearchParams();
    // Check URL params for initial load (e.g., from homepage genre links)
    const urlParams = new URLSearchParams(window.location.search);

    // If input is empty but URL has title, use it (initial load only)
    let title = titleVal;
    if (!title && urlParams.has('title') && !document.getElementById('search-title').dataset.touched) {
        title = urlParams.get('title');
        document.getElementById('search-title').value = title;
    }

    // If genre not manually set, check URL params
    if (!document.getElementById('search-genre').dataset.touched && urlParams.has('genre')) {
        document.getElementById('search-genre').value = urlParams.get('genre');
    }

    // Build query parameters for the API call
    if (title) params.set('title', title);
    if (genre || document.getElementById('search-genre').value) params.set('genre', document.getElementById('search-genre').value);

    // Parse price range filter into min/max values
    if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (min) params.set('minPrice', min);
        if (max) params.set('maxPrice', max);
    }

    const grid = document.getElementById('results-grid');
    const countEl = document.getElementById('results-count');

    // Show loading spinner while fetching
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        // Fetch games from backend search web service
        const res = await fetch(`${API_BASE}/games?${params.toString()}`);
        const games = await res.json();

        // Update results count display
        countEl.textContent = `${games.length} game${games.length !== 1 ? 's' : ''} found`;

        // Show empty state if no games match
        if (games.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="icon"><i class="icon-search"></i></div><p>No games match your search. Try different filters.</p></div>';
            return;
        }

        // Render game cards with pricing logic
        grid.innerHTML = games.map(game => {
            const genres = (game.Genres || []).slice(0, 2).join(' • ') || 'Unknown';
            const price = parseFloat(game.Price);
            const disc = parseInt(game.SalePercent) || 0;
            let priceHtml = `฿${price.toFixed(2)}`;

            // Handle different pricing types
            if (game.PricingType === 'Free') {
                priceHtml = '<span style="color:var(--accent-tertiary);">FREE</span>';
            } else if (disc === 100) {
                priceHtml = `<span class="sale-badge" style="font-size:0.7rem;">100% OFF</span> <span class="original-price">฿${price.toFixed(2)}</span> FREE`;
            } else if (disc > 0) {
                const salePrice = (price * (1 - disc / 100)).toFixed(2);
                priceHtml = `<span class="sale-badge" style="font-size:0.7rem;">-${disc}%</span> <span class="original-price">฿${price.toFixed(2)}</span> ฿${salePrice}`;
            }

            return `
            <a href="/game?id=${game.GameID}" class="card" style="cursor:pointer;">
                <div class="card-image-wrapper">
                    <img src="${game.ImageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'}" 
                         alt="${game.Title}" class="card-image"
                         onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'">
                </div>
                <div class="card-body">
                    <span class="card-genre">${genres}</span>
                    <h3 class="card-title">${game.Title}</h3>
                    <div class="card-price">${priceHtml}</div>
                </div>
            </a>
        `}).join('');
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="empty-state"><div class="icon">⚠<i class="icon-star-empty"></i><i class="icon-star-empty"></i>/div><p>Failed to load games. Please ensure the backend server is running on port 3000.</p></div>';
        countEl.textContent = 'Error';
    }
}

/**
 * Sets up the navigation bar search input.
 * Also marks inputs as "touched" to prevent URL params from overriding
 * user-entered values on subsequent searches.
 */
function setupNavSearch() {
    const input = document.getElementById('nav-search-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                window.location.href = `/games?title=${encodeURIComponent(input.value.trim())}`;
            }
        });
    }

    // Mark inputs as touched to avoid overriding with URL params if user is typing
    document.getElementById('search-title').addEventListener('input', (e) => {
        e.target.dataset.touched = 'true';
    });
    document.getElementById('search-genre').addEventListener('change', (e) => {
        e.target.dataset.touched = 'true';
    });
}
