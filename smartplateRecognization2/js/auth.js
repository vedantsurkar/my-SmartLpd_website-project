// Authentication JavaScript - Real API Implementation
const API_BASE_URL = 'http://localhost:8080/api';

// Utility function to show status messages
function showAuthStatus(message, type = 'info') {
    const statusDiv = document.getElementById('authStatus') || createStatusDiv();
    statusDiv.textContent = message;
    statusDiv.className = `auth-status auth-status-${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

function createStatusDiv() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'authStatus';
    statusDiv.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
    `;
    document.querySelector('.auth-card').prepend(statusDiv);
    return statusDiv;
}

// Debug function
function debugAuth() {
    console.log('🔍 Auth Debug Info:');
    console.log('Token:', localStorage.getItem('authToken'));
    console.log('Username:', localStorage.getItem('username'));
    console.log('Role:', localStorage.getItem('userRole'));
    console.log('Backend URL:', API_BASE_URL);
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get stored token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Get stored username
function getUsername() {
    return localStorage.getItem('username');
}

// Get stored role
function getUserRole() {
    return localStorage.getItem('userRole');
}

// Login function - Simplified version
async function login(username, password) {
    try {
        // For now, let any user login without backend validation
        const mockUsers = {
            'testauthority': { role: 'AUTHORITY' },
            'testcitizen': { role: 'CITIZEN' },
            'vedantss': { role: 'AUTHORITY' }
            // Add your actual username here
        };

        const user = mockUsers[username.toLowerCase()];
        
        if (user && password === 'password123') {
            // Create a mock token
            const mockToken = 'mock-token-' + Date.now();
            
            // Store user info
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', user.role);
            
            showAuthStatus('Login successful! Redirecting...', 'success');
            
            // Debug info
            console.log('🔐 Mock login successful:', { username, role: user.role });
            
            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'AUTHORITY') {
                    window.location.href = 'manage-fines.html';
                } else {
                    window.location.href = 'check-fine.html';
                }
            }, 1000);
            
            return { success: true, token: mockToken, username: username, role: user.role };
        } else {
            showAuthStatus('Invalid username or password', 'error');
            return { success: false, message: 'Invalid credentials' };
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthStatus('Login failed: ' + error.message, 'error');
        return { success: false, message: 'Login failed' };
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            // Auto-login after successful registration
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('userRole', data.role);
            
            showAuthStatus('Registration successful! Redirecting...', 'success');
            
            // Debug info
            debugAuth();
            
            setTimeout(() => {
                if (data.role === 'AUTHORITY') {
                    window.location.href = 'manage-fines.html';
                } else {
                    window.location.href = 'check-fine.html';
                }
            }, 1500);
            
            return data;
        } else {
            showAuthStatus(data.message || 'Registration failed', 'error');
            return data;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthStatus('Registration failed: ' + error.message, 'error');
        return { success: false, message: 'Registration failed: ' + error.message };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for status messages
    const style = document.createElement('style');
    style.textContent = `
        .auth-status {
            padding: 12px;
            margin: 15px 0;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            display: none;
        }
        .auth-status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .auth-status-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .auth-status-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    `;
    document.head.appendChild(style);

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showAuthStatus('Please fill in all fields', 'error');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            await login(username, password);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;
            
            if (password !== confirmPassword) {
                showAuthStatus('Passwords do not match!', 'error');
                return;
            }

            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: password,
                fullName: document.getElementById('fullname').value,
                role: role
            };

            // Basic validation
            if (!userData.username || !userData.email || !userData.password || !userData.fullName || !userData.role) {
                showAuthStatus('Please fill in all fields', 'error');
                return;
            }

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

            await register(userData);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }

    // Update navigation based on login status
    updateNavigation();
    debugAuth(); // Debug info on page load
});

// Update navigation to show user info
function updateNavigation() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (isLoggedIn()) {
        const username = getUsername();
        const userRole = getUserRole();
        authButtons.innerHTML = `
            <div class="user-info">
                <span>Welcome, ${username} (${userRole})</span>
                <button class="btn btn-outline" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;

        // Show authority link if user is authority
        if (userRole === 'AUTHORITY') {
            const authorityLink = document.getElementById('authorityLink');
            if (authorityLink) {
                authorityLink.style.display = 'block';
            }
        }
    }
}