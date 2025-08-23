// Authentication system
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.updateUI();
    }

    // Check if user is already authenticated
    async checkAuthStatus() {
        const token = api.getAuthToken();
        if (token) {
            try {
                const user = await api.getCurrentUser();
                if (user) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    this.updateUI();
                } else {
                    api.clearAuth();
                }
            } catch (error) {
                console.warn('Failed to get current user:', error);
                api.clearAuth();
            }
        }
    }

    // Bind authentication events
    bindEvents() {
        // Login form events
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form events
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button events
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Switch between login/register forms
        const switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => this.switchToRegister(e));
        }

        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => this.switchToLogin(e));
        }
    }

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';

        try {
            const response = await api.login(email, password);
            
            if (response.token) {
                this.currentUser = response.user;
                this.isAuthenticated = true;
                
                this.showNotification('Успешный вход!', 'success');
                this.updateUI();
                
                // Redirect to account page or previous page
                const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
                if (returnUrl) {
                    window.location.href = returnUrl;
                } else {
                    window.location.href = '/pages/account.html';
                }
            }
        } catch (error) {
            this.showNotification('Ошибка входа: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Handle register form submission
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const name = form.querySelector('#register-name').value;
        const email = form.querySelector('#register-email').value;
        const password = form.querySelector('#register-password').value;
        const confirmPassword = form.querySelector('#register-confirm-password').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистрация...';

        try {
            const userData = {
                name,
                email,
                password
            };

            const response = await api.register(userData);
            
            this.showNotification('Регистрация успешна! Теперь вы можете войти.', 'success');
            
            // Switch to login form
            this.switchToLogin();
            
        } catch (error) {
            this.showNotification('Ошибка регистрации: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Handle logout
    async handleLogout(e) {
        e.preventDefault();
        
        try {
            await api.logout();
            this.currentUser = null;
            this.isAuthenticated = false;
            
            this.showNotification('Вы успешно вышли из системы', 'success');
            this.updateUI();
            
            // Redirect to home page
            window.location.href = '/';
            
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateUI();
            window.location.href = '/';
        }
    }

    // Switch to register form
    switchToRegister(e) {
        e.preventDefault();
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginTab = document.querySelector('[data-tab="login"]');
        const registerTab = document.querySelector('[data-tab="register"]');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
        
        if (loginTab && registerTab) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    // Switch to login form
    switchToLogin(e) {
        e.preventDefault();
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginTab = document.querySelector('[data-tab="login"]');
        const registerTab = document.querySelector('[data-tab="register"]');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
        
        if (loginTab && registerTab) {
            registerTab.classList.remove('active');
            loginTab.classList.add('active');
        }
    }

    // Update UI based on authentication status
    updateUI() {
        const authContainer = document.querySelector('.auth-container');
        const userContainer = document.querySelector('.user-container');
        const cartCounter = document.querySelector('.cart-counter');
        const accountLink = document.querySelector('.account-link');

        if (this.isAuthenticated && this.currentUser) {
            // Show user info
            if (authContainer) authContainer.style.display = 'none';
            if (userContainer) {
                userContainer.style.display = 'flex';
                const userName = userContainer.querySelector('.user-name');
                if (userName) userName.textContent = this.currentUser.name;
            }

            // Enable cart functionality
            if (cartCounter) cartCounter.style.display = 'block';
            if (accountLink) accountLink.style.display = 'block';

            // Update account page if on it
            this.updateAccountPage();
        } else {
            // Show login form
            if (authContainer) authContainer.style.display = 'block';
            if (userContainer) userContainer.style.display = 'none';

            // Disable cart functionality
            if (cartCounter) cartCounter.style.display = 'none';
            if (accountLink) accountLink.style.display = 'none';
        }
    }

    // Update account page content
    updateAccountPage() {
        if (window.location.pathname.includes('account.html')) {
            const account = new Account();
            account.loadUserData();
        }
    }

    // Check if user can access protected pages
    requireAuth(redirectUrl = '/pages/account.html') {
        if (!this.isAuthenticated) {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `${redirectUrl}?returnUrl=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Create global auth instance
const auth = new Auth();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
