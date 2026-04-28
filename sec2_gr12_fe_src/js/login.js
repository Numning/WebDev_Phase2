/**
 * login.js —Admin Login Page Logic
 * 
 * Handles administrator authentication by sending credentials to
 * the backend authentication web service. On successful login,
 * stores admin info in localStorage and redirects to the admin dashboard.
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'https://gamehub.bexcon.tech/api';

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to admin dashboard immediately
    if (localStorage.getItem('adminUser')) {
        window.location.href = '/admin';
        return;
    }

    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const loginBtn = document.getElementById('login-btn');

    /**
     * Handle login form submission.
     * Sends username and password to the authentication web service.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validate that both fields are filled
        if (!username || !password) {
            showError('Please fill in all fields.');
            return;
        }

        // Show loading state on button
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;

        try {
            // Call the authentication web service
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store admin info in localStorage for session management
                localStorage.setItem('adminUser', JSON.stringify(data.admin));
                window.location.href = '/admin';
            } else {
                showError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            showError('Server error. Please ensure the backend server is running on port 3000.');
        } finally {
            // Reset button state regardless of outcome
            loginBtn.textContent = 'Sign In';
            loginBtn.disabled = false;
        }
    });

    /**
     * Displays an error message on the login form.
     * @param {string} msg - The error message to display
     */
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
});
