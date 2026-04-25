/**
 * admin.js — Admin Dashboard Logic
 * 
 * Manages the administrator dashboard for game management (CRUD operations).
 * Features:
 * - Authentication check (redirects to login if not authenticated)
 * - List all games in a data table
 * - Add new games via modal form
 * - Edit existing games via modal form
 * - Delete games with confirmation
 * - Genre checkbox selection for multi-genre assignment
 * - Gallery image URL management
 * - Pricing type toggle (Regular/Sale/Free) with sale percentage
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'http://localhost:3000/api';

// Available genres for the genre checkbox selection
const AVAILABLE_GENRES = [
    "Action", "RPG", "Adventure", "Strategy", "Simulation", 
    "Racing", "Sports", "Fighting", "Puzzle", "Sci-Fi", 
    "Survival", "Horror", "MMORPG", "Shooter", "Platformer", 
    "Cyberpunk", "Fantasy", "Medieval", "Indie", "Casual", 
    "Tactical", "Stealth", "Competitive", "Multiplayer", "Space", 
    "Crafting", "Open World", "Arcade"
];

document.addEventListener('DOMContentLoaded', () => {
    // ── Authentication Check ──
    // Redirect to login page if admin is not logged in
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('admin-welcome').textContent = `Welcome, ${adminUser.firstName} ${adminUser.lastName}`;

    // ── Logout Handler ──
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminUser');
        window.location.href = 'index.html';
    });

    // ── Load Games Table ──
    loadGames();

    // ── Modal Logic ──
    const modal = document.getElementById('game-modal');
    const form = document.getElementById('game-form');

    // Open modal for adding a new game
    document.getElementById('add-game-btn').addEventListener('click', () => openModal());
    // Close modal handlers
    document.getElementById('modal-close').addEventListener('click', () => closeModal());
    document.getElementById('modal-cancel').addEventListener('click', () => closeModal());

    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ── Pricing Type Toggle ──
    // Show/hide the sale percentage input based on pricing type selection
    const pricingTypeSelect = document.getElementById('form-pricing-type');
    pricingTypeSelect.addEventListener('change', () => {
        const saleGroup = document.getElementById('sale-percent-group');
        saleGroup.style.display = pricingTypeSelect.value === 'Sale' ? 'block' : 'none';
        
        const saleInput = document.getElementById('form-sale-percent');
        saleInput.setAttribute('max', '100');
        
        if (pricingTypeSelect.value !== 'Sale') {
            saleInput.value = '';
        }
    });

    // ── Gallery Image Button ──
    document.getElementById('add-gallery-btn').addEventListener('click', () => {
        addGalleryInput('');
    });

    // ── Form Submission Handler ──
    // Handles both creating new games and updating existing ones
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gameId = document.getElementById('form-game-id').value;

        // Collect gallery image URLs from dynamic inputs
        const galleryInputs = document.querySelectorAll('.gallery-url-input');
        const galleryUrls = [];
        galleryInputs.forEach(input => {
            if (input.value.trim()) galleryUrls.push(input.value.trim());
        });

        // Collect selected genres from checkboxes
        const selectedGenres = [];
        document.querySelectorAll('input[name="genre"]:checked').forEach(cb => {
            selectedGenres.push(cb.value);
        });

        // Build game data object to send to the API
        const gameData = {
            title: document.getElementById('form-title').value.trim(),
            genres: selectedGenres,
            price: document.getElementById('form-price').value,
            pricingType: document.getElementById('form-pricing-type').value,
            salePercent: document.getElementById('form-sale-percent').value || 0,
            description: document.getElementById('form-description').value.trim(),
            releaseDate: document.getElementById('form-release-date').value || null,
            imageUrl: document.getElementById('form-image-url').value.trim(),
            galleryImages: galleryUrls.join('|||')
        };

        try {
            let res;
            if (gameId) {
                // Update existing game via PUT request
                res = await fetch(`${API_BASE}/games/${gameId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameData)
                });
            } else {
                // Create new game via POST request
                res = await fetch(`${API_BASE}/games`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameData)
                });
            }

            if (res.ok) {
                closeModal();
                loadGames();
                showToast(gameId ? 'Game updated successfully!' : 'Game added successfully!', 'success');
            } else {
                showToast('Failed to save game.', 'error');
            }
        } catch (err) {
            showToast('Server error. Please try again.', 'error');
        }
    });
});

/**
 * Adds a new gallery image URL input row to the modal form.
 * Each row has a text input and a remove button.
 * @param {string} value - Pre-filled URL value (empty for new inputs)
 */
function addGalleryInput(value) {
    const container = document.getElementById('gallery-inputs');
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
    row.innerHTML = `
        <input type="url" class="form-control gallery-url-input" value="${value}" placeholder="https://example.com/screenshot.jpg" style="flex:1;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()" style="flex-shrink:0;">✕</button>
    `;
    container.appendChild(row);
}

/**
 * Loads all games from the backend API and renders them in the data table.
 * Each row includes game info, pricing badge, and edit/delete action buttons.
 */
async function loadGames() {
    const tbody = document.getElementById('games-tbody');
    tbody.innerHTML = '<tr><td colspan="7"><div class="loading-spinner"><div class="spinner"></div></div></td></tr>';

    try {
        const res = await fetch(`${API_BASE}/games`);
        const games = await res.json();

        if (games.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No games found. Add your first game!</td></tr>';
            return;
        }

        // Render each game as a table row
        tbody.innerHTML = games.map(game => {
            const pricingBadge = getPricingBadge(game);
            const genreDisplay = (game.Genres || []).join(', ');

            return `
            <tr>
                <td style="color: var(--text-muted);">#${game.GameID}</td>
                <td>
                    <div class="table-game-info">
                        <img src="${game.ImageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=80&h=80&fit=crop'}" 
                             alt="${game.Title}" class="table-game-thumb"
                             onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=80&h=80&fit=crop'">
                        <strong>${game.Title}</strong>
                    </div>
                </td>
                <td><span class="card-genre" style="margin:0;">${genreDisplay}</span></td>
                <td><strong>฿${parseFloat(game.Price).toFixed(2)}</strong></td>
                <td>${pricingBadge}</td>
                <td style="color: var(--text-secondary);">${formatDate(game.ReleaseDate)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editGame(${game.GameID})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteGame(${game.GameID}, '${escapeHtml(game.Title)}')">Delete</button>
                    </div>
                </td>
            </tr>
        `}).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Failed to load games. Is the backend server running on port 3000?</td></tr>';
    }
}

/**
 * Returns an HTML badge element representing the game's pricing type.
 * @param {Object} game - The game object
 * @returns {string} HTML string for the pricing badge
 */
function getPricingBadge(game) {
    if (game.PricingType === 'Sale') {
        if (parseInt(game.SalePercent) === 100) {
             return `<span class="sale-badge" style="background: #e91e63;">100% OFF (FREE)</span>`;
        }
        return `<span class="sale-badge" style="font-size:0.75rem; padding: 2px 8px; border-radius: 4px;">SALE -${game.SalePercent}%</span>`;
    } else if (game.PricingType === 'Free') {
        return `<span class="sale-badge" style="font-size:0.75rem; padding: 2px 8px; border-radius: 4px; background: #00c853;">FREE</span>`;
    }
    return `<span style="color: var(--text-muted); font-size: 0.85rem;">Regular</span>`;
}

/**
 * Opens the game modal for adding or editing a game.
 * Populates form fields with existing game data when editing.
 * @param {Object|null} game - The game object to edit, or null for a new game
 */
function openModal(game = null) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const saleGroup = document.getElementById('sale-percent-group');
    const galleryContainer = document.getElementById('gallery-inputs');
    const genreContainer = document.getElementById('genre-checkboxes');

    // Clear gallery inputs from previous modal usage
    galleryContainer.innerHTML = '';

    if (game) {
        // ── Edit Mode ──
        title.textContent = 'Edit Game';
        document.getElementById('form-game-id').value = game.GameID;
        document.getElementById('form-title').value = game.Title;
        document.getElementById('form-price').value = game.Price;
        document.getElementById('form-pricing-type').value = game.PricingType || 'Regular';
        document.getElementById('form-sale-percent').value = game.SalePercent || '';
        document.getElementById('form-description').value = game.Description || '';
        document.getElementById('form-release-date').value = game.ReleaseDate ? game.ReleaseDate.split('T')[0] : '';
        document.getElementById('form-image-url').value = game.ImageUrl || '';

        saleGroup.style.display = game.PricingType === 'Sale' ? 'block' : 'none';

        // Load existing gallery images into input fields
        if (game.GalleryImages) {
            try {
                 const parsed = JSON.parse(game.GalleryImages);
                 if (Array.isArray(parsed)) {
                     parsed.forEach(url => addGalleryInput(url));
                 } else {
                     game.GalleryImages.split('|||').filter(u => u.trim()).forEach(url => addGalleryInput(url));
                 }
            } catch (e) {
                 game.GalleryImages.split('|||').filter(u => u.trim()).forEach(url => addGalleryInput(url));
            }
        }
        
        // Render genre checkboxes with existing selections checked
        const selected = game.Genres || [];
        genreContainer.innerHTML = AVAILABLE_GENRES.map(g => {
            const isChecked = selected.includes(g) ? 'checked' : '';
            return `
                <label class="genre-checkbox-label">
                    <input type="checkbox" name="genre" value="${g}" ${isChecked}>
                    ${g}
                </label>
            `;
        }).join('');

    } else {
        // ── Add Mode ──
        title.textContent = 'Add New Game';
        document.getElementById('game-form').reset();
        document.getElementById('form-game-id').value = '';
        document.getElementById('form-pricing-type').value = 'Regular';
        saleGroup.style.display = 'none';
        
        // Render empty genre checkboxes
        genreContainer.innerHTML = AVAILABLE_GENRES.map(g => `
            <label class="genre-checkbox-label">
                <input type="checkbox" name="genre" value="${g}">
                ${g}
            </label>
        `).join('');
    }

    modal.classList.add('show');
}

/**
 * Closes the game modal dialog.
 */
function closeModal() {
    document.getElementById('game-modal').classList.remove('show');
}

/**
 * Fetches a game's details from the API and opens the edit modal.
 * @param {number} id - The ID of the game to edit
 */
async function editGame(id) {
    try {
        const res = await fetch(`${API_BASE}/games/${id}`);
        const game = await res.json();
        openModal(game);
    } catch (err) {
        showToast('Failed to load game details.', 'error');
    }
}

/**
 * Deletes a game after user confirmation.
 * Sends a DELETE request to the backend API.
 * @param {number} id - The game ID to delete
 * @param {string} title - The game title (for the confirmation dialog)
 */
async function deleteGame(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
        const res = await fetch(`${API_BASE}/games/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadGames();
            showToast('Game deleted successfully!', 'success');
        } else {
            showToast('Failed to delete game.', 'error');
        }
    } catch (err) {
        showToast('Server error. Please try again.', 'error');
    }
}

/**
 * Displays a temporary toast notification at the bottom of the page.
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Formats a date string into a short human-readable format.
 * @param {string} dateStr - ISO date string from the database
 * @returns {string} Formatted date like "Jan 1, 2026"
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Escapes single quotes and double quotes in HTML strings.
 * Used for safely embedding game titles in onclick attributes.
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
