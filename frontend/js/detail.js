/**
 * detail.js — Game Detail Page Logic
 * 
 * Displays comprehensive information about a single game including:
 * - Image gallery with slider
 * - Game title, genre badges, pricing info
 * - Tabbed content (Description, System Requirements, User Ratings)
 * - User review submission form
 * - Wishlist toggle functionality
 * - "Back to Search Results" navigation link
 * 
 * Fetches game data, reviews, and review statistics from the backend API.
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    setupNavSearch();
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');
    if (!gameId) {
        showError('No game ID specified.');
        return;
    }
    // Generate or retrieve session ID for wishlist functionality
    if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', 'sess-' + Math.random().toString(36).substr(2, 12));
    }
    loadGameDetail(gameId);
});

/**
 * Loads all game detail data from the backend API.
 * Makes parallel requests for game info, reviews, and review stats.
 * @param {string|number} id - The game ID to load
 */
async function loadGameDetail(id) {
    const container = document.getElementById('detail-container');

    try {
        // Fetch game, reviews, and review stats in parallel
        const [gameRes, reviewsRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/games/${id}`),
            fetch(`${API_BASE}/reviews/${id}`),
            fetch(`${API_BASE}/reviews/stats/${id}`)
        ]);
        if (!gameRes.ok) throw new Error('Game not found');
        const game = await gameRes.json();
        const reviews = await reviewsRes.json();
        const stats = await statsRes.json();

        // Update page title with game name
        document.title = `${game.Title} — GameHub`;

        // Check if this game is in the user's wishlist
        const sessionId = localStorage.getItem('sessionId');
        let isWishlisted = false;
        try {
            const wishRes = await fetch(`${API_BASE}/wishlist/check/${sessionId}/${id}`);
            const wishData = await wishRes.json();
            isWishlisted = wishData.wishlisted;
        } catch (e) { /* ignore wishlist check errors */ }

        // ── Pricing Logic ──
        const price = parseFloat(game.Price);
        const disc = parseInt(game.SalePercent) || 0;
        let salePrice = disc > 0 ? (price * (1 - disc / 100)).toFixed(2) : null;
        let priceHtml = '';
        let buttonText = '';

        if (disc === 100) {
            // 100% off — show as free
            salePrice = "0.00";
            priceHtml = `
                <div class="price">
                    <span class="sale-badge" style="font-size:0.9rem; vertical-align:middle;">100% OFF</span>
                    <span style="text-decoration:line-through; color:var(--text-muted); font-size:1rem;">฿${price.toFixed(2)}</span>
                    <span style="color:var(--accent-tertiary); margin-left:8px;">FREE</span>
                </div>
            `;
            buttonText = `Get for Free`;
        } else if (game.PricingType === 'Free') {
            priceHtml = `<div class="price" style="color:var(--accent-tertiary);">FREE TO PLAY</div>`;
            buttonText = `Play for Free`;
        } else if (disc > 0) {
            // Discounted price
             priceHtml = `
                <div class="price">
                    <span class="sale-badge" style="font-size:0.9rem; vertical-align:middle;">-${disc}%</span>
                    <span style="text-decoration:line-through; color:var(--text-muted); font-size:1rem;">฿${price.toFixed(2)}</span>
                    <span style="color:var(--accent-primary); margin-left:8px;">฿${salePrice}</span>
                </div>
            `;
            buttonText = `Buy Now - ฿${salePrice}`;
        } else {
            // Regular price
            priceHtml = `<div class="price">฿${price.toFixed(2)}</div>`;
            buttonText = `Buy Now - ฿${price.toFixed(2)}`;
        }

        // ── Genre Badges ──
        const genres = game.Genres || [];
        let genreHtml = genres.length > 0
            ? `<div class="genre-badge-list">${genres.map(g => `<span class="genre-badge-chip">${g}</span>`).join('')}</div>`
            : `<span class="genre-badge">Unknown</span>`;

        // ── System Requirements (simulated data) ──
        const sysReq = {
            os: 'Windows 10 64-bit / macOS 12+',
            processor: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
            memory: '16 GB RAM',
            graphics: 'NVIDIA GTX 1060 / AMD RX 580',
            storage: '50 GB available space'
        };

        // ── Rating Statistics from database ──
        const avgRating = parseFloat(stats.averageRating) || 0;
        const totalReviews = stats.totalReviews || 0;
        const distribution = stats.distribution || [0, 0, 0, 0, 0];
        const filledStars = Math.round(avgRating);
        const starsHtml = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);

        // ── Build Gallery Images ──
        const mainImage = game.ImageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop';
        const gallery = [mainImage];
        if (game.GalleryImages) {
            try {
                const parsed = JSON.parse(game.GalleryImages);
                if (Array.isArray(parsed)) gallery.push(...parsed);
                else {
                    const extra = game.GalleryImages.split('|||').filter(u => u.trim());
                    gallery.push(...extra);
                }
            } catch (e) {
                const extra = game.GalleryImages.split('|||').filter(u => u.trim());
                gallery.push(...extra);
            }
        }

        // ── Wishlist Button State ──
        const wishBtnClass = isWishlisted ? 'btn btn-danger' : 'btn btn-secondary';
        const wishBtnText = isWishlisted ? '❤️ Wishlisted' : '♡ Add to Wishlist';

        // ── Render Reviews HTML ──
        const reviewsHtml = reviews.length > 0
            ? reviews.map(r => `
                <div style="background:var(--surface-secondary); border-radius:12px; padding:16px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="color:var(--text-primary);">👤 ${r.ReviewerName}</strong>
                        <span style="color:var(--accent-primary);">${'★'.repeat(r.Rating)}${'☆'.repeat(5 - r.Rating)}</span>
                    </div>
                    <p style="color:var(--text-secondary); margin:0; line-height:1.5;">${r.Comment}</p>
                    <small style="color:var(--text-muted); display:block; margin-top:8px;">${new Date(r.CreatedAt).toLocaleDateString()}</small>
                </div>
            `).join('')
            : '<p style="color:var(--text-muted);">No reviews yet. Be the first to review!</p>';

        // ── Build Detail Page HTML ──
        container.innerHTML = `
            <a href="/games" class="back-to-search" id="back-to-search">← Back to Search Results</a>

            <div class="detail-hero">
                <div class="detail-slider" id="detail-slider"></div>
                <div class="detail-info">
                    ${genreHtml}
                    <h1>${game.Title}</h1>
                    <p class="developer">by GameHub Studios · Released ${formatDate(game.ReleaseDate)}</p>
                    ${priceHtml}
                    <div class="action-buttons">
                        <button class="btn btn-success" onclick="addToCart(${game.GameID})">🛒 Add to Cart</button>
                        <button class="btn btn-primary" onclick="alert('${buttonText}!')">${buttonText}</button>
                        <button class="${wishBtnClass}" id="wishlist-btn" data-game-id="${game.GameID}" style="margin-top:8px; width:100%;">${wishBtnText}</button>
                    </div>
                </div>
            </div>

            <div class="detail-tabs">
                <div class="tab-headers">
                    <button class="tab-header active" data-tab="description">Description</button>
                    <button class="tab-header" data-tab="requirements">System Requirements</button>
                    <button class="tab-header" data-tab="ratings">User Ratings (${totalReviews})</button>
                </div>

                <div class="tab-content active" id="tab-description">
                    <h3>About This Game</h3>
                    <p>${game.Description || 'No description available.'}</p>
                </div>

                <div class="tab-content" id="tab-requirements">
                    <h3>Minimum System Requirements</h3>
                    <table class="data-table" style="max-width:600px;">
                        <tbody>
                            <tr><td style="font-weight:600;color:var(--text-secondary);">OS</td><td>${sysReq.os}</td></tr>
                            <tr><td style="font-weight:600;color:var(--text-secondary);">Processor</td><td>${sysReq.processor}</td></tr>
                            <tr><td style="font-weight:600;color:var(--text-secondary);">Memory</td><td>${sysReq.memory}</td></tr>
                            <tr><td style="font-weight:600;color:var(--text-secondary);">Graphics</td><td>${sysReq.graphics}</td></tr>
                            <tr><td style="font-weight:600;color:var(--text-secondary);">Storage</td><td>${sysReq.storage}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="tab-content" id="tab-ratings">
                    <h3>Player Ratings</h3>
                    <div class="rating-stars">${starsHtml} <span style="color:var(--text-primary);font-size:1.2rem;font-weight:700;">${avgRating}</span> <span style="color:var(--text-muted);font-size:0.85rem;">(${totalReviews.toLocaleString()} reviews)</span></div>
                    ${distribution.map((pct, i) => `
                        <div class="rating-bar-container">
                            <span style="min-width:40px;">${5 - i} ★</span>
                            <div class="rating-bar"><div class="rating-bar-fill" style="width:${pct}%;"></div></div>
                            <span style="min-width:35px;text-align:right;">${pct}%</span>
                        </div>
                    `).join('')}

                    <hr style="border-color:var(--surface-tertiary); margin: 24px 0;">

                    <h3>Reviews</h3>
                    ${reviewsHtml}

                    <hr style="border-color:var(--surface-tertiary); margin: 24px 0;">

                    <h3>Write a Review</h3>
                    <form id="review-form" style="max-width:500px;">
                        <div style="margin-bottom:12px;">
                            <label style="display:block; margin-bottom:4px; color:var(--text-secondary);">Your Name</label>
                            <input type="text" id="review-name" class="form-control" placeholder="Enter your name" required>
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; margin-bottom:4px; color:var(--text-secondary);">Rating</label>
                            <select id="review-rating" class="form-control" required>
                                <option value="">Select rating</option>
                                <option value="5">★★★★★ (5)</option>
                                <option value="4">★★★★☆ (4)</option>
                                <option value="3">★★★☆☆ (3)</option>
                                <option value="2">★★☆☆☆ (2)</option>
                                <option value="1">★☆☆☆☆ (1)</option>
                            </select>
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; margin-bottom:4px; color:var(--text-secondary);">Comment</label>
                            <textarea id="review-comment" class="form-control" rows="3" placeholder="Share your experience..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Review</button>
                    </form>
                </div>
            </div>
        `;

        // Initialize interactive components
        renderSlider(gallery, game.Title);
        setupTabs();
        setupReviewForm(id);
        updateCartBadge();
        setupWishlistBtn(id);

    } catch (err) {
        showError('Game not found or server is not running.');
        console.error(err);
    }
}

/**
 * Sets up the review submission form.
 * Submits a new review to the backend API via POST request.
 * @param {string|number} gameId - The ID of the game being reviewed
 */
function setupReviewForm(gameId) {
    const form = document.getElementById('review-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('review-name').value.trim();
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value.trim();
        if (!name || !rating) return;

        try {
            const res = await fetch(`${API_BASE}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: parseInt(gameId), reviewerName: name, rating: parseInt(rating), comment })
            });
            if (res.ok) {
                // Reload the detail page to show the new review
                loadGameDetail(gameId);
            }
        } catch (err) {
            console.error('Failed to submit review:', err);
        }
    });
}

/**
 * Sets up the wishlist toggle button.
 * Adds or removes the game from the user's session-based wishlist.
 * @param {string|number} gameId - The ID of the game
 */
function setupWishlistBtn(gameId) {
    const btn = document.getElementById('wishlist-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const sessionId = localStorage.getItem('sessionId');
        const isWishlisted = btn.classList.contains('btn-danger');
        try {
            if (isWishlisted) {
                // Remove from wishlist
                await fetch(`${API_BASE}/wishlist/${sessionId}/${gameId}`, { method: 'DELETE' });
                btn.className = 'btn btn-secondary';
                btn.style.marginTop = '8px';
                btn.style.width = '100%';
                btn.textContent = '♡ Add to Wishlist';
            } else {
                // Add to wishlist
                await fetch(`${API_BASE}/wishlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: parseInt(gameId), sessionId })
                });
                btn.className = 'btn btn-danger';
                btn.style.marginTop = '8px';
                btn.style.width = '100%';
                btn.textContent = '❤️ Wishlisted';
            }
        } catch (err) {
            console.error('Wishlist error:', err);
        }
    });
}

/**
 * Renders the image gallery slider with thumbnail navigation.
 * @param {Array} images - Array of image URLs for the gallery
 * @param {string} title - The game title for alt text
 */
function renderSlider(images, title) {
    const container = document.getElementById('detail-slider');
    let currentIndex = 0;

    // Main slider image with navigation arrows
    const mainHtml = `
        <div class="slider-main">
            <img src="${images[0]}" alt="${title}" id="slider-main-img">
            <div class="slider-nav-btn slider-prev" id="slider-prev">‹</div>
            <div class="slider-nav-btn slider-next" id="slider-next">›</div>
        </div>
    `;

    // Thumbnail strip below main image
    const thumbsHtml = `
        <div class="slider-thumbs" id="slider-thumbs">
            ${images.map((img, i) => `
                <div class="slider-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${title} thumbnail">
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = mainHtml + thumbsHtml;

    const mainImg = document.getElementById('slider-main-img');
    const thumbEls = document.querySelectorAll('.slider-thumb');

    /** Updates the slider to show the image at the given index */
    function updateSlider(index) {
        currentIndex = index;
        mainImg.src = images[currentIndex];
        thumbEls.forEach(t => t.classList.remove('active'));
        thumbEls[currentIndex].classList.add('active');
    }

    // Previous/next arrow click handlers
    document.getElementById('slider-prev').addEventListener('click', () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = images.length - 1;
        updateSlider(newIndex);
    });

    document.getElementById('slider-next').addEventListener('click', () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= images.length) newIndex = 0;
        updateSlider(newIndex);
    });

    // Thumbnail click handlers
    thumbEls.forEach(thumb => {
        thumb.addEventListener('click', () => {
            updateSlider(parseInt(thumb.dataset.index));
        });
    });
}

/**
 * Sets up the tabbed content navigation (Description, Requirements, Ratings).
 * Shows/hides tab panels when tab headers are clicked.
 */
function setupTabs() {
    document.querySelectorAll('.tab-header').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-header').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

/**
 * Displays an error message when the game cannot be loaded.
 * @param {string} msg - The error message to display
 */
function showError(msg) {
    const container = document.getElementById('detail-container');
    container.innerHTML = `<div class="empty-state" style="padding-top:150px;"><div class="icon">😕</div><h3>${msg}</h3><a href="/games" class="btn btn-primary" style="margin-top:1rem;">Browse Games</a></div>`;
}

/**
 * Formats a date string into a human-readable format.
 * @param {string} dateStr - ISO date string from the database
 * @returns {string} Formatted date like "January 1, 2026"
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Sets up the navigation bar search input on the detail page.
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
}

/**
 * Adds a game to the shopping cart via the backend API.
 * @param {number} gameId - The ID of the game to add
 */
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
            // Show brief success feedback
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Added!';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
    }
}

/**
 * Updates the cart badge count in the navbar.
 */
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
