/**
 * Task 6: Database Integration & User Authentication
 * app.js - Client Controller, Tab Handlers, Fetch CRUD and Response Console Logger
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let currentUser = null;

    // --- DOM ELEMENT CACHE ---
    // Sections
    const dbStatusBanner = document.getElementById('dbStatusBanner');
    const dbStatusText = document.getElementById('dbStatusText');
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');

    // Tab buttons & Panels
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const regSubmitBtn = document.getElementById('regSubmitBtn');

    // Inputs - Login
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    // Inputs - Register
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regRole = document.getElementById('regRole');

    // Sidebar & Profile Info
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRoleBadge = document.getElementById('profileRoleBadge');
    const logoutBtn = document.getElementById('logoutBtn');

    // Action buttons
    const fetchProtectedBtn = document.getElementById('fetchProtectedBtn');
    const fetchAdminBtn = document.getElementById('fetchAdminBtn');
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');

    // Console Panels
    const consolePlaceholder = document.getElementById('consolePlaceholder');
    const consoleOutput = document.getElementById('consoleOutput');
    const consoleCode = consoleOutput.querySelector('code');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // --- RUN INITIAL CHECKS ---
    checkDbStatus();
    checkSession();

    // --- TAB TOGGLES ---
    tabLoginBtn.addEventListener('click', () => switchTab('login'));
    tabRegisterBtn.addEventListener('click', () => switchTab('register'));

    // --- FORM ACTIONS ---
    loginForm.addEventListener('submit', handleLoginSubmit);
    registerForm.addEventListener('submit', handleRegisterSubmit);
    logoutBtn.addEventListener('click', handleLogout);

    // --- PROTECTED DATA ACTIONS ---
    fetchProtectedBtn.addEventListener('click', () => fetchProtectedData('/api/data/protected'));
    fetchAdminBtn.addEventListener('click', () => fetchProtectedData('/api/data/admin'));
    clearConsoleBtn.addEventListener('click', clearConsole);

    // --- LIVE INPUT VALIDATIONS ---
    setupInputValidations();

    // --- CONTROLLER LOGIC FUNCTIONS ---

    // Switch between Sign In / Sign Up tabs
    function switchTab(target) {
        resetFormErrors(loginForm);
        resetFormErrors(registerForm);
        loginForm.reset();
        registerForm.reset();

        if (target === 'login') {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginPanel.classList.remove('hidden');
            registerPanel.classList.add('hidden');
        } else {
            tabLoginBtn.classList.remove('active');
            tabRegisterBtn.classList.add('active');
            loginPanel.classList.add('hidden');
            registerPanel.classList.remove('hidden');
        }
    }

    // Check Database connection status on backend
    async function checkDbStatus() {
        try {
            const response = await fetch('/api/db-status');
            const data = await response.json();
            
            if (!data.connected) {
                dbStatusBanner.classList.add('error');
                dbStatusText.textContent = data.error || 'Database is offline. Features will be limited.';
                dbStatusBanner.classList.remove('hidden');
            } else {
                dbStatusBanner.classList.add('hidden');
            }
        } catch (err) {
            dbStatusBanner.classList.add('error');
            dbStatusText.textContent = 'Server is unreachable. Please verify backend state.';
            dbStatusBanner.classList.remove('hidden');
        }
    }

    // Verify User Session State on Load
    async function checkSession() {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (data.authenticated) {
                currentUser = data.user;
                showDashboard(true);
            } else {
                currentUser = null;
                showDashboard(false);
            }
        } catch (err) {
            currentUser = null;
            showDashboard(false);
        }
    }

    // Toggle between Auth screen & Dashboard screen
    function showDashboard(isActive) {
        if (isActive && currentUser) {
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            
            // Populate Profile card
            const initials = currentUser.username
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            
            profileAvatar.textContent = initials || 'U';
            profileName.textContent = currentUser.username;
            profileEmail.textContent = currentUser.email || 'Session Active (Offline Mode)';
            profileRoleBadge.textContent = currentUser.role.toUpperCase();
            
            if (currentUser.role === 'admin') {
                profileRoleBadge.style.color = 'var(--cyan)';
                profileRoleBadge.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                profileRoleBadge.style.backgroundColor = 'var(--cyan-light)';
            } else {
                profileRoleBadge.style.color = 'var(--purple)';
                profileRoleBadge.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                profileRoleBadge.style.backgroundColor = 'var(--purple-light)';
            }
        } else {
            authSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            clearConsole();
        }
    }

    // Handle Login Submit
    async function handleLoginSubmit(e) {
        e.preventDefault();

        // Perform Client-side validations
        const vEmail = validateEmail(loginEmail.value);
        const vPassword = validatePassword(loginPassword.value);

        setFieldState(loginEmail, vEmail.isValid, vEmail.message);
        setFieldState(loginPassword, vPassword.isValid, vPassword.message);

        if (!vEmail.isValid || !vPassword.isValid) return;

        setBtnLoading(loginSubmitBtn, true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail.value,
                    password: loginPassword.value
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Login failed.');

            showToast(data.message || 'Logged in successfully.', 'success');
            currentUser = data.user;
            loginForm.reset();
            showDashboard(true);
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setBtnLoading(loginSubmitBtn, false);
        }
    }

    // Handle Register Submit
    async function handleRegisterSubmit(e) {
        e.preventDefault();

        // Perform Client validations
        const vName = validateUsername(regUsername.value);
        const vEmail = validateEmail(regEmail.value);
        const vPassword = validatePassword(regPassword.value);
        const vRole = validateRole(regRole.value);

        setFieldState(regUsername, vName.isValid, vName.message);
        setFieldState(regEmail, vEmail.isValid, vEmail.message);
        setFieldState(regPassword, vPassword.isValid, vPassword.message);
        setFieldState(regRole, vRole.isValid, vRole.message);

        if (!vName.isValid || !vEmail.isValid || !vPassword.isValid || !vRole.isValid) return;

        setBtnLoading(regSubmitBtn, true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: regUsername.value,
                    email: regEmail.value,
                    password: regPassword.value,
                    role: regRole.value
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Registration failed.');

            showToast(data.message || 'Registered successfully!', 'success');
            registerForm.reset();
            switchTab('login');
            
            // Pre-fill email in login tab
            loginEmail.value = regEmail.value;
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setBtnLoading(regSubmitBtn, false);
        }
    }

    // Handle Logout Action
    async function handleLogout() {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            const data = await response.json();
            
            showToast(data.message || 'Logged out successfully.', 'success');
            currentUser = null;
            showDashboard(false);
        } catch (err) {
            showToast('Failed to logout. Please try again.', 'error');
        }
    }

    // Fetch Protected data from secure routes
    async function fetchProtectedData(url) {
        // Log query intent to console
        printConsole(`Fetching route: ${url} ...`);

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Log response details to the pre element
            printConsole(JSON.stringify(data, null, 2), response.ok ? 'success' : 'error');

            if (!response.ok) {
                if (response.status === 403) {
                    showToast('Forbidden. Administrative authorization checks failed.', 'error');
                } else if (response.status === 401) {
                    showToast('Unauthorized. Session expired.', 'error');
                    checkSession();
                } else {
                    showToast(data.message || 'API request failed.', 'error');
                }
            } else {
                showToast('API Data retrieved successfully.', 'success');
            }
        } catch (err) {
            printConsole(`API connection error: ${err.message}`, 'error');
            showToast('Failed to reach target server.', 'error');
        }
    }

    // --- CONSOLE LOGGER HELPERS ---

    function printConsole(text, status = 'default') {
        consolePlaceholder.classList.add('hidden');
        consoleOutput.classList.remove('hidden');

        // Color coding console strings
        if (status === 'success') {
            consoleCode.style.color = '#10b981'; // Emerald
        } else if (status === 'error') {
            consoleCode.style.color = '#f43f5e'; // Rose/Red
        } else {
            consoleCode.style.color = '#e2e8f0'; // Gray
        }

        consoleCode.textContent = text;
    }

    function clearConsole() {
        consoleCode.textContent = '';
        consoleOutput.classList.add('hidden');
        consolePlaceholder.classList.remove('hidden');
    }

    // --- VALIDATION HELPERS ---

    function setupInputValidations() {
        // Login bindings
        [['input', 'blur']].forEach(events => {
            events.forEach(e => {
                loginEmail.addEventListener(e, () => {
                    const r = validateEmail(loginEmail.value);
                    setFieldState(loginEmail, r.isValid, r.message);
                });
                loginPassword.addEventListener(e, () => {
                    const r = validatePassword(loginPassword.value);
                    setFieldState(loginPassword, r.isValid, r.message);
                });
            });
        });

        // Registration bindings
        [['input', 'blur']].forEach(events => {
            events.forEach(e => {
                regUsername.addEventListener(e, () => {
                    const r = validateUsername(regUsername.value);
                    setFieldState(regUsername, r.isValid, r.message);
                });
                regEmail.addEventListener(e, () => {
                    const r = validateEmail(regEmail.value);
                    setFieldState(regEmail, r.isValid, r.message);
                });
                regPassword.addEventListener(e, () => {
                    const r = validatePassword(regPassword.value);
                    setFieldState(regPassword, r.isValid, r.message);
                });
                regRole.addEventListener(e, () => {
                    const r = validateRole(regRole.value);
                    setFieldState(regRole, r.isValid, r.message);
                });
            });
        });
    }

    function validateUsername(val) {
        if (!val || val.trim().length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters.' };
        }
        return { isValid: true, message: '' };
    }

    function validateEmail(val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val || !emailRegex.test(val.trim())) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }
        return { isValid: true, message: '' };
    }

    function validatePassword(val) {
        if (!val || val.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters.' };
        }
        return { isValid: true, message: '' };
    }

    function validateRole(val) {
        if (!val) {
            return { isValid: false, message: 'Role is required.' };
        }
        return { isValid: true, message: '' };
    }

    function setFieldState(field, isValid, message) {
        const group = field.closest('.form-group');
        const errSpan = group.querySelector('.error-msg');

        if (isValid) {
            group.classList.remove('invalid');
            errSpan.textContent = '';
        } else {
            group.classList.add('invalid');
            errSpan.textContent = message;
        }
    }

    function resetFormErrors(form) {
        const groups = form.querySelectorAll('.form-group');
        groups.forEach(g => {
            g.classList.remove('invalid');
            const err = g.querySelector('.error-msg');
            if (err) err.textContent = '';
        });
    }

    // --- SYSTEM UTILITIES ---

    function setBtnLoading(btn, isLoading) {
        const spinner = btn.querySelector('.btn-spinner');
        const text = btn.querySelector('.btn-text');

        if (isLoading) {
            btn.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (text) text.classList.add('hidden');
        } else {
            btn.disabled = false;
            if (spinner) spinner.classList.add('hidden');
            if (text) text.classList.remove('hidden');
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';

        toast.innerHTML = `
            <i class="${iconClass} toast-icon"></i>
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
