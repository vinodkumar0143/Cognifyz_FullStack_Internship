// State variables
let token = localStorage.getItem('token');
let currentUser = null;
let apiLogCount = 0;

// DOM Selectors
const dbStatusBadge = document.getElementById('db-status-badge');
const apiStatusBadge = document.getElementById('api-status-badge');
const userSession = document.getElementById('user-session');
const sessionUsername = document.getElementById('session-username');
const logoutBtn = document.getElementById('logout-btn');

const guestView = document.getElementById('guest-view');
const dashboardView = document.getElementById('dashboard-view');
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const searchForm = document.getElementById('search-form');
const searchCityInput = document.getElementById('search-city');
const suggestBtns = document.querySelectorAll('.suggest-btn');

const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const weatherResultContainer = document.getElementById('weather-result-container');

const toggleConsoleBtn = document.getElementById('toggle-console-btn');
const consoleLogCount = document.getElementById('console-log-count');
const debugConsole = document.getElementById('debug-console');
const clearConsoleBtn = document.getElementById('clear-console-btn');
const closeConsoleBtn = document.getElementById('close-console-btn');
const consoleLogs = document.getElementById('console-logs');

// Toast Notification Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Custom Logger to Debug Console
function logApiCall(method, url, requestBody, status, responseBody) {
    apiLogCount++;
    consoleLogCount.textContent = apiLogCount;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Request log
    const reqDiv = document.createElement('div');
    reqDiv.className = 'console-line req';
    reqDiv.innerHTML = `[${timestamp}] OUTGOING: <strong>${method}</strong> ${url}`;
    if (requestBody) {
        reqDiv.innerHTML += ` <span class="json-format">${JSON.stringify(requestBody, null, 2)}</span>`;
    }
    consoleLogs.appendChild(reqDiv);
    
    // Response log
    const resDiv = document.createElement('div');
    resDiv.className = status >= 400 ? 'console-line err' : 'console-line res';
    resDiv.innerHTML = `[${timestamp}] INCOMING: STATUS ${status}`;
    if (responseBody) {
        resDiv.innerHTML += ` <span class="json-format">${JSON.stringify(responseBody, null, 2)}</span>`;
    }
    consoleLogs.appendChild(resDiv);
    
    // Scroll console to bottom
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Wrapper for API calls (incorporates authorization headers and logs details)
async function apiRequest(endpoint, options = {}) {
    const url = `/api${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        let data = {};
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { rawText: text };
        }
        
        let reqBody = null;
        if (options.body) {
            try {
                reqBody = JSON.parse(options.body);
            } catch (e) {
                reqBody = options.body;
            }
        }
        
        logApiCall(options.method || 'GET', url, reqBody, response.status, data);
        
        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (err) {
        console.error('Fetch error:', err);
        logApiCall(options.method || 'GET', url, options.body ? JSON.parse(options.body) : null, 500, { error: err.message });
        return {
            status: 500,
            ok: false,
            data: { message: 'Network connection error. Check if backend server is online.' }
        };
    }
}

// View manager
function updateView() {
    if (token) {
        guestView.style.display = 'none';
        dashboardView.style.display = 'block';
        userSession.style.display = 'flex';
        if (currentUser) {
            sessionUsername.textContent = currentUser.username;
        }
    } else {
        guestView.style.display = 'flex';
        dashboardView.style.display = 'none';
        userSession.style.display = 'none';
        currentUser = null;
    }
}

// Load Server Status
async function loadStatus() {
    const { ok, data } = await apiRequest('/status');
    if (ok) {
        // DB status check
        const dbBadge = dbStatusBadge.querySelector('.indicator');
        const dbText = dbStatusBadge.querySelector('.label');
        if (data.database && data.database.state === 1) {
            dbBadge.className = 'indicator connected';
            dbText.textContent = `MongoDB: Connected`;
        } else {
            dbBadge.className = 'indicator';
            dbText.textContent = `MongoDB: Disconnected`;
        }

        // Weather API mode check
        const apiText = apiStatusBadge.querySelector('.label');
        apiText.textContent = data.weatherApiMode;
    } else {
        dbStatusBadge.querySelector('.indicator').className = 'indicator';
        dbStatusBadge.querySelector('.label').textContent = 'MongoDB: Offline';
        apiStatusBadge.querySelector('.label').textContent = 'Weather API: Unknown';
    }
}

// Authenticate profile
async function fetchProfile() {
    if (!token) return false;
    const { ok, data } = await apiRequest('/auth/profile');
    if (ok && data.success) {
        currentUser = data.user;
        return true;
    } else {
        // Token expired/invalid
        token = null;
        localStorage.removeItem('token');
        return false;
    }
}

// Authenticated: Load Search History list
async function loadHistory() {
    const { ok, data } = await apiRequest('/weather/history');
    if (ok && data.success) {
        renderHistoryList(data.history);
    }
}

function renderHistoryList(history) {
    if (!history || history.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No search history recorded yet.</li>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
        const temp = item.weatherData ? `${item.weatherData.temp}°C` : 'N/A';
        const description = item.weatherData ? item.weatherData.description : '';
        const isMock = item.weatherData && item.weatherData.isMock;
        const icon = item.weatherData ? item.weatherData.icon : '01d';
        
        return `
            <li class="history-item">
                <div class="hist-left" onclick="reSearchCity('${item.query}')">
                    <div class="hist-icon">
                        <img src="https://openweathermap.org/img/wn/${icon}.png" width="30" height="30" alt="weather-icon" style="filter: drop-shadow(0 0 2px rgba(255,255,255,0.2))">
                    </div>
                    <div class="hist-details">
                        <span class="hist-city">${item.query} <span class="w-country">${item.weatherData ? item.weatherData.country : ''}</span></span>
                        <div class="hist-info">
                            <span class="temp-val">${temp}</span>
                            <span>${description}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                </div>
                <div class="hist-right">
                    <button class="btn-delete" onclick="deleteHistoryItem(event, '${item._id}')" title="Delete entry"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </li>
        `;
    }).join('');
}

// Actions
async function handleSearch(city) {
    if (!city || city.trim() === '') return;
    
    weatherResultContainer.innerHTML = `
        <div class="weather-empty-state">
            <div class="weather-globe" style="animation: rotateGlobe 2s infinite linear;"><i class="fa-solid fa-circle-notch"></i></div>
            <h3>Fetching Weather...</h3>
            <p>Querying API for "${city}" and saving logs to MongoDB...</p>
        </div>
    `;
    
    const { ok, data } = await apiRequest(`/weather/search?city=${encodeURIComponent(city)}`);
    
    if (ok && data.success) {
        renderWeatherCard(data.weather);
        loadHistory(); // Reload query history
    } else {
        const errorMsg = data.message || 'Error occurred while fetching weather.';
        showToast(errorMsg, 'error');
        
        weatherResultContainer.innerHTML = `
            <div class="weather-empty-state">
                <div class="weather-globe" style="color: var(--color-danger);"><i class="fa-solid fa-circle-xmark"></i></div>
                <h3 style="color: var(--color-danger);">Search Failed</h3>
                <p>${errorMsg}</p>
                <button onclick="resetWeatherView()" class="btn btn-sm btn-primary" style="margin-top: 1rem;">Reset View</button>
            </div>
        `;
    }
}

function renderWeatherCard(weather) {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const isMock = weather.isMock;
    
    // Choose beautiful color gradient based on temperature
    let bgStyle = '';
    if (weather.temp > 28) {
        // Hot weather
        bgStyle = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)';
    } else if (weather.temp < 10) {
        // Cold weather
        bgStyle = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)';
    } else {
        // Mild weather
        bgStyle = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)';
    }
    
    weatherResultContainer.style.background = bgStyle;
    weatherResultContainer.innerHTML = `
        <div class="weather-active">
            <div class="weather-header-info">
                <div>
                    <h2 class="w-city">${weather.cityName}<span class="w-country">${weather.country}</span></h2>
                    <p class="w-date">${dateStr}</p>
                </div>
                <span class="w-source-badge ${!isMock ? 'real' : ''}">
                    ${isMock ? '<i class="fa-solid fa-code"></i> Mock Weather API' : '<i class="fa-solid fa-cloud"></i> OpenWeatherMap Live'}
                </span>
            </div>
            
            <div class="weather-main-panel">
                <div class="w-temp-wrapper">
                    <span class="w-temp">${weather.temp}°C</span>
                    <span class="w-desc">
                        <img src="https://openweathermap.org/img/wn/${weather.icon}.png" width="30" height="30" alt="desc-icon" style="vertical-align: middle;">
                        ${weather.description}
                    </span>
                </div>
                
                <div class="w-icon-container">
                    <img class="w-icon-img" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
                </div>
            </div>
            
            <div class="weather-metrics-grid">
                <div class="metric-box">
                    <div class="metric-icon"><i class="fa-solid fa-droplet"></i></div>
                    <div class="metric-details">
                        <span class="metric-label">Humidity</span>
                        <span class="metric-value">${weather.humidity}%</span>
                    </div>
                </div>
                <div class="metric-box wind">
                    <div class="metric-icon"><i class="fa-solid fa-wind"></i></div>
                    <div class="metric-details">
                        <span class="metric-label">Wind Speed</span>
                        <span class="metric-value">${weather.windSpeed} m/s</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function resetWeatherView() {
    weatherResultContainer.style.background = '';
    weatherResultContainer.innerHTML = `
        <div class="weather-empty-state">
            <div class="weather-globe"><i class="fa-solid fa-earth-americas"></i></div>
            <h3>No Weather Data Loaded</h3>
            <p>Search for a city above to fetch real-time data from the API and save logs to MongoDB.</p>
        </div>
    `;
}

// Window functions linked to inline HTML actions
window.reSearchCity = function(city) {
    searchCityInput.value = city;
    handleSearch(city);
};

window.deleteHistoryItem = async function(event, itemId) {
    event.stopPropagation(); // Avoid triggering reSearchCity
    
    const { ok, data } = await apiRequest(`/weather/history/${itemId}`, {
        method: 'DELETE'
    });
    
    if (ok && data.success) {
        showToast('Search log removed successfully.', 'success');
        loadHistory();
    } else {
        showToast(data.message || 'Failed to remove log.', 'error');
    }
};

window.resetWeatherView = resetWeatherView;

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { ok, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (ok && data.success) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        showToast('Logged in successfully!', 'success');
        updateView();
        loadHistory();
        loadStatus();
    } else {
        showToast(data.message || 'Login failed. Please verify credentials.', 'error');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const { ok, data } = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    
    if (ok && data.success) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        showToast('Registration complete. Welcome!', 'success');
        updateView();
        loadHistory();
        loadStatus();
    } else {
        showToast(data.message || 'Registration failed.', 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    showToast('Signed out successfully.', 'info');
    updateView();
    resetWeatherView();
    loadStatus();
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = searchCityInput.value;
    handleSearch(city);
});

suggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const city = btn.textContent;
        searchCityInput.value = city;
        handleSearch(city);
    });
});

// Auth form toggles
document.getElementById('to-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.classList.remove('active');
    setTimeout(() => {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
        setTimeout(() => registerCard.classList.add('active'), 50);
    }, 400);
});

document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.classList.remove('active');
    setTimeout(() => {
        registerCard.style.display = 'none';
        loginCard.style.display = 'block';
        setTimeout(() => loginCard.classList.add('active'), 50);
    }, 400);
});

// Console controls
toggleConsoleBtn.addEventListener('click', () => {
    debugConsole.classList.toggle('open');
});

closeConsoleBtn.addEventListener('click', () => {
    debugConsole.classList.remove('open');
});

clearConsoleBtn.addEventListener('click', () => {
    consoleLogs.innerHTML = '<div class="console-line system">Console cleared.</div>';
    apiLogCount = 0;
    consoleLogCount.textContent = '0';
});

clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear your entire search history?')) return;
    
    const { ok, data } = await apiRequest('/weather/history', {
        method: 'DELETE'
    });
    
    if (ok && data.success) {
        showToast('All search history logs cleared.', 'success');
        loadHistory();
    } else {
        showToast(data.message || 'Failed to clear history list.', 'error');
    }
});

// Bootstrapping
async function init() {
    loadStatus();
    if (token) {
        const isAuthed = await fetchProfile();
        if (isAuthed) {
            updateView();
            loadHistory();
        } else {
            updateView();
        }
    } else {
        updateView();
    }
}

document.addEventListener('DOMContentLoaded', init);
