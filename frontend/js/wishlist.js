/**
 * wishlist.js — Wishlist Logic
 * 
 * Fetches and displays wishlisted games. Allows moving items to cart.
 */

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', 'sess-' + Math.random().toString(36).substr(2, 12));
    }
    setupNavSearch();
    updateCartBadge();
    loadWishlist();
});

async function loadWishlist() {
    const container = document.getElementById('wishlist-grid');
    const sessionId = localStorage.getItem('sessionId');
    
    try {
        const res = await fetch(`${API_BASE}/wishlist/${sessionId}`);
        const games = await res.json();

        document.getElementById('wishlist-summary').textContent = `${games.length} saved item${games.length !== 1 ? 's' : ''}`;

        if (games.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="icon">♡</div>
                    <p>Your wishlist is empty.</p>
                    <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Games</a>
                </div>`;
            return;
        }

        container.innerHTML = games.map(game => {
            const price = parseFloat(game.Price);
            const disc = parseInt(game.SalePercent) || 0;
            let priceHtml = `฿${price.toFixed(2)}`;

            if (game.PricingType === 'Free') {
                priceHtml = '<span style="color:var(--accent-tertiary);">FREE</span>';
            } else if (disc === 100) {
                priceHtml = `FREE`;
            } else if (disc > 0) {
                const salePrice = (price * (1 - disc / 100)).toFixed(2);
                priceHtml = `<span class="sale-badge">-${disc}%</span> ฿${salePrice}`;
            }

            return `
            <div class="card" style="position:relative;">
                <button class="btn-danger" style="position:absolute; top:8px; right:8px; z-index:10; border-radius:50%; width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;" onclick="removeWishlist(${game.GameID})">✕</button>
                <a href="detail.html?id=${game.GameID}">
                    <div class="card-image-wrapper">
                        <img src="${game.ImageUrl || 'https://via.placeholder.com/300'}" alt="${game.Title}" class="card-image">
                    </div>
                </a>
                <div class="card-body">
                    <h3 class="card-title">${game.Title}</h3>
                    <div class="card-price" style="margin-bottom:12px;">${priceHtml}</div>
                    <button class="btn btn-primary" style="width:100%;" onclick="addToCart(${game.GameID})">Add to Cart</button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Error loading wishlist.</div>';
    }
}

async function removeWishlist(gameId) {
    const sessionId = localStorage.getItem('sessionId');
    try {
        await fetch(`${API_BASE}/wishlist/${sessionId}/${gameId}`, { method: 'DELETE' });
        loadWishlist();
    } catch (err) {
        console.error(err);
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
