/**
 * user-login.js — User Registration & Login Logic
 * 
 * Handles switching between Sign In and Create Account tabs.
 * Submits forms to the appropriate backend endpoints.
 * Stores user session locally.
 */

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (localStorage.getItem('userSession')) {
        window.location.href = '/home';
        return;
    }

    setupTabs();
    setupLoginForm();
    setupRegisterForm();
    setupNavSearch();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

function setupLoginForm() {
    const form = document.getElementById('user-login-form');
    const errorMsg = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Store user session and a generic session ID if not exists
                localStorage.setItem('userSession', JSON.stringify(data.user));
                if (!localStorage.getItem('sessionId')) {
                    localStorage.setItem('sessionId', 'sess-' + Math.random().toString(36).substr(2, 12));
                }
                // Redirect back to home
                window.location.href = '/home';
            } else {
                errorMsg.textContent = data.error || 'Invalid credentials';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error.';
            errorMsg.style.display = 'block';
        } finally {
            loginBtn.textContent = 'Sign In';
            loginBtn.disabled = false;
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById('user-register-form');
    const errorMsg = document.getElementById('register-error');
    const successMsg = document.getElementById('register-success');
    const regBtn = document.getElementById('register-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';

        const firstName = document.getElementById('reg-firstname').value.trim();
        const lastName = document.getElementById('reg-lastname').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        regBtn.textContent = 'Creating...';
        regBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, username, email, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                successMsg.textContent = 'Account created! You can now sign in.';
                successMsg.style.display = 'block';
                form.reset();
                // Switch to login tab
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                }, 1500);
            } else {
                errorMsg.textContent = data.error || 'Registration failed';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error.';
            errorMsg.style.display = 'block';
        } finally {
            regBtn.textContent = 'Create Account';
            regBtn.disabled = false;
        }
    });
}

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
