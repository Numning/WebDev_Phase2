/**
 * cart.js — Shopping Cart Logic
 * 
 * Fetches cart items, displays order summary, allows removing items,
 * and handles updating quantities.
 */

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Generate session ID if missing
    if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', 'sess-' + Math.random().toString(36).substr(2, 12));
    }
    setupNavSearch();
    updateCartBadge();
    loadCartItems();

    document.getElementById('clear-cart-btn').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear your cart?')) return;
        const sessionId = localStorage.getItem('sessionId');
        try {
            await fetch(`${API_BASE}/cart/clear/${sessionId}`, { method: 'DELETE' });
            loadCartItems();
            updateCartBadge();
        } catch (err) {
            console.error(err);
        }
    });
});

async function loadCartItems() {
    const container = document.getElementById('cart-items');
    const sessionId = localStorage.getItem('sessionId');
    
    try {
        const res = await fetch(`${API_BASE}/cart/${sessionId}`);
        const items = await res.json();
        
        let subtotal = 0;
        let totalDiscount = 0;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🛒</div>
                    <p>Your cart is empty.</p>
                    <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Games</a>
                </div>`;
            document.getElementById('cart-summary').textContent = '0 items';
            document.getElementById('cart-subtotal').textContent = '฿0.00';
            document.getElementById('cart-discount').textContent = '-฿0.00';
            document.getElementById('cart-total').textContent = '฿0.00';
            return;
        }

        const totalItems = items.reduce((acc, item) => acc + item.Quantity, 0);
        document.getElementById('cart-summary').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

        container.innerHTML = items.map(item => {
            const price = parseFloat(item.Price);
            const disc = parseInt(item.SalePercent) || 0;
            let finalPrice = price;
            
            if (item.PricingType === 'Free' || disc === 100) {
                finalPrice = 0;
            } else if (disc > 0) {
                finalPrice = price * (1 - disc / 100);
                totalDiscount += (price - finalPrice) * item.Quantity;
            }
            
            subtotal += price * item.Quantity;

            return `
                <div class="cart-item-card" style="display:flex; gap:16px; background:var(--bg-card); padding:16px; border-radius:12px; margin-bottom:16px;">
                    <img src="${item.ImageUrl || 'https://via.placeholder.com/150'}" alt="${item.Title}" style="width:120px; height:80px; object-fit:cover; border-radius:8px;">
                    <div style="flex:1;">
                        <h3 style="margin-bottom:4px; font-size:1.1rem;">${item.Title}</h3>
                        <div style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:8px;">
                            ${finalPrice === 0 ? '<span style="color:var(--accent-tertiary);">FREE</span>' : `฿${finalPrice.toFixed(2)}`}
                            ${disc > 0 && finalPrice > 0 ? `<span style="text-decoration:line-through; font-size:0.8rem; margin-left:8px; color:var(--text-muted);">฿${price.toFixed(2)}</span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <input type="number" value="${item.Quantity}" min="1" class="form-control" style="width:70px; padding:4px 8px;" onchange="updateQuantity(${item.CartID}, this.value)">
                            <button class="btn btn-sm" style="background:transparent; color:#ff4757; text-decoration:underline;" onclick="removeFromCart(${item.CartID})">Remove</button>
                        </div>
                    </div>
                    <div style="text-align:right; font-weight:700; font-size:1.2rem;">
                        ${finalPrice === 0 ? '฿0.00' : `฿${(finalPrice * item.Quantity).toFixed(2)}`}
                    </div>
                </div>
            `;
        }).join('');

        const finalTotal = subtotal - totalDiscount;
        document.getElementById('cart-subtotal').textContent = `฿${subtotal.toFixed(2)}`;
        document.getElementById('cart-discount').textContent = `-฿${totalDiscount.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `฿${finalTotal.toFixed(2)}`;

    } catch (err) {
        container.innerHTML = '<div class="empty-state">Error loading cart.</div>';
    }
}

async function updateQuantity(cartId, qty) {
    if (qty < 1) return;
    try {
        await fetch(`${API_BASE}/cart/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: parseInt(qty) })
        });
        loadCartItems();
        updateCartBadge();
    } catch (err) {
        console.error('Update qty error:', err);
    }
}

async function removeFromCart(cartId) {
    try {
        await fetch(`${API_BASE}/cart/${cartId}`, { method: 'DELETE' });
        loadCartItems();
        updateCartBadge();
    } catch (err) {
        console.error('Remove item error:', err);
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
