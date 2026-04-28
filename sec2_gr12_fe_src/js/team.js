/**
 * team.js —Team Page Logic
 * 
 * Renders team member cards with personal information including:
 * - Profile images
 * - Full names and student IDs
 * - Roles within the project
 * - Social media links (at least one per member, as required)
 * 
 * Also sets up the navigation bar search functionality.
 */

// Base URL for the backend API server (runs on separate port)
const API_BASE = 'https://gamehub.bexcon.tech/api';

document.addEventListener('DOMContentLoaded', () => {
    setupNavSearch();

    // ── Team Member Data ──
    // Each member includes name, ID, role, image, and social media link
    const teamMembers = [
        {
            firstName: 'Promdpoori',
            lastName: 'Athipornwanit',
            studentId: '6788004',
            role: 'Frontend Developer',
            image: '/images/team/6788004.jpg',
            social: { platform: 'GitHub', url: 'https://github.com/promdpooriath-create', icon: '<i class="icon-users"></i>' }
        },
        {
            firstName: 'Numning',
            lastName: 'Sungkagul',
            studentId: '6788121',
            role: 'Backend Developer',
            image: '/images/team/6788121.jpg',
            social: { platform: 'GitHub', url: 'https://github.com/Numning', icon: '<i class="icon-users"></i>' }
        },
        {
            firstName: 'Kasidech',
            lastName: 'Thongpakdee',
            studentId: '6788134',
            role: 'Database Designer',
            image: '/images/team/6788134.jpg',
            social: { platform: 'GitHub', url: 'https://github.com/Kasidechthn', icon: '<i class="icon-users"></i>' }
        },
        {
            firstName: 'Nannalin',
            lastName: 'Leelaparung',
            studentId: '6788181',
            role: 'UI/UX Designer',
            image: '/images/team/6788181.jpg',
            social: { platform: 'GitHub', url: 'https://github.com/nannalinlee-beep', icon: '<i class="icon-users"></i>' }
        },
    ];

    const grid = document.getElementById('team-grid');

    // ── Render Team Cards ──
    if (grid) {
        grid.innerHTML = teamMembers.map(member => {
            return `
                <div class="team-card">
                    <img src="${member.image}" alt="${member.firstName} ${member.lastName}" class="team-avatar-img">
                    <h3>${member.firstName} ${member.lastName}</h3>
                    <div class="student-id">${member.studentId}</div>
                    <div class="role">${member.role}</div>
                    <div class="team-social">
                        <a href="${member.social.url}" target="_blank" rel="noopener" class="social-link" title="${member.social.platform}">
                            ${member.social.icon} ${member.social.platform}
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
});

/**
 * Sets up the navigation bar search input.
 * Pressing Enter redirects to the search page with the query.
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
