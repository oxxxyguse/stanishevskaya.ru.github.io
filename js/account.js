// Account functionality
class Account {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'profile';
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.loadOrders();
        this.loadFavorites();
        this.loadSettings();
    }

    loadUserData() {
        // Simulate loading user data from localStorage or API
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserInterface();
        } else {
            // Demo user data
            this.currentUser = {
                id: 1,
                name: 'Иван Иванов',
                email: 'ivan@example.com',
                phone: '+7 (999) 123-45-67',
                birthDate: '1990-01-01',
                isAuthenticated: true
            };
            this.saveUserData();
        }
    }

    saveUserData() {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
    }

    updateUserInterface() {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (this.currentUser && this.currentUser.isAuthenticated) {
            userName.textContent = this.currentUser.name;
            userEmail.textContent = this.currentUser.email;
        } else {
            userName.textContent = 'Гость';
            userEmail.textContent = 'Не авторизован';
        }
    }

    bindEvents() {
        // Tab navigation
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Profile editing
        const editProfileBtn = document.getElementById('editProfileBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const cancelProfileBtn = document.getElementById('cancelProfileBtn');

        editProfileBtn.addEventListener('click', () => this.enableProfileEditing());
        saveProfileBtn.addEventListener('click', () => this.saveProfile());
        cancelProfileBtn.addEventListener('click', () => this.cancelProfileEditing());

        // Settings
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => this.logout());
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
    }

    enableProfileEditing() {
        const inputs = document.querySelectorAll('#profileForm input');
        const editBtn = document.getElementById('editProfileBtn');
        const actions = document.getElementById('profileActions');

        inputs.forEach(input => {
            input.disabled = false;
        });

        editBtn.style.display = 'none';
        actions.style.display = 'flex';
    }

    saveProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;
        const birthDate = document.getElementById('profileBirth').value;

        // Validate inputs
        if (!name || !email) {
            showNotification('Имя и email обязательны для заполнения', 'error');
            return;
        }

        // Update user data
        this.currentUser.name = name;
        this.currentUser.email = email;
        this.currentUser.phone = phone;
        this.currentUser.birthDate = birthDate;

        this.saveUserData();
        this.updateUserInterface();
        this.disableProfileEditing();

        showNotification('Профиль успешно обновлен', 'success');
    }

    cancelProfileEditing() {
        this.disableProfileEditing();
        
        // Restore original values
        document.getElementById('profileName').value = this.currentUser.name;
        document.getElementById('profileEmail').value = this.currentUser.email;
        document.getElementById('profilePhone').value = this.currentUser.phone;
        document.getElementById('profileBirth').value = this.currentUser.birthDate;
    }

    disableProfileEditing() {
        const inputs = document.querySelectorAll('#profileForm input');
        const editBtn = document.getElementById('editProfileBtn');
        const actions = document.getElementById('profileActions');

        inputs.forEach(input => {
            input.disabled = true;
        });

        editBtn.style.display = 'inline-block';
        actions.style.display = 'none';
    }

    loadOrders() {
        const ordersList = document.getElementById('ordersList');
        const ordersEmpty = document.getElementById('ordersEmpty');

        // Simulate orders data
        const orders = [
            {
                id: 1,
                date: '2024-01-15',
                status: 'delivered',
                total: 45000,
                items: ['Вечернее платье "Элегант"', 'Туфли "Грейс"']
            },
            {
                id: 2,
                date: '2024-01-10',
                status: 'processing',
                total: 25000,
                items: ['Блузка "Нежность"']
            }
        ];

        if (orders.length === 0) {
            ordersList.style.display = 'none';
            ordersEmpty.style.display = 'block';
        } else {
            ordersList.style.display = 'block';
            ordersEmpty.style.display = 'none';
            ordersList.innerHTML = orders.map(order => this.createOrderHTML(order)).join('');
        }
    }

    createOrderHTML(order) {
        const statusText = {
            'delivered': 'Доставлен',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'cancelled': 'Отменен'
        };

        const statusClass = {
            'delivered': 'success',
            'processing': 'warning',
            'shipped': 'info',
            'cancelled': 'error'
        };

        return `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Заказ #${order.id}</h4>
                        <p class="order-date">${new Date(order.date).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div class="order-status ${statusClass[order.status]}">
                        ${statusText[order.status]}
                    </div>
                </div>
                
                <div class="order-items">
                    <p><strong>Товары:</strong> ${order.items.join(', ')}</p>
                </div>
                
                <div class="order-footer">
                    <span class="order-total">${this.formatPrice(order.total)}</span>
                    <button class="btn btn-outline btn-sm" onclick="account.viewOrderDetails(${order.id})">
                        Подробнее
                    </button>
                </div>
            </div>
        `;
    }

    loadFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        const favoritesEmpty = document.getElementById('favoritesEmpty');

        // Simulate favorites data
        const favorites = [
            {
                id: 1,
                name: 'Вечернее платье "Элегант"',
                price: 250000,
                image: 'fas fa-laptop'
            },
            {
                id: 2,
                name: 'Блузка "Нежность"',
                price: 120000,
                image: 'fas fa-mobile-alt'
            }
        ];

        if (favorites.length === 0) {
            favoritesGrid.style.display = 'none';
            favoritesEmpty.style.display = 'block';
        } else {
            favoritesGrid.style.display = 'grid';
            favoritesEmpty.style.display = 'none';
            favoritesGrid.innerHTML = favorites.map(item => this.createFavoriteHTML(item)).join('');
        }
    }

    createFavoriteHTML(item) {
        return `
            <div class="favorite-item">
                <div class="favorite-image">
                    <i class="${item.image}"></i>
                </div>
                <div class="favorite-details">
                    <h4>${item.name}</h4>
                    <p class="favorite-price">${this.formatPrice(item.price)}</p>
                </div>
                <div class="favorite-actions">
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${item})">
                        В корзину
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="account.removeFavorite(${item.id})">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                </div>
            </div>
        `;
    }

    loadSettings() {
        // Load saved settings from localStorage
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const languageSelect = document.getElementById('languageSelect');
        const currencySelect = document.getElementById('currencySelect');

        const settings = JSON.parse(localStorage.getItem('userSettings')) || {
            emailNotifications: true,
            smsNotifications: false,
            language: 'ru',
            currency: 'RUB'
        };

        emailNotifications.checked = settings.emailNotifications;
        smsNotifications.checked = settings.smsNotifications;
        languageSelect.value = settings.language;
        currencySelect.value = settings.currency;
    }

    saveSettings() {
        const emailNotifications = document.getElementById('emailNotifications').checked;
        const smsNotifications = document.getElementById('smsNotifications').checked;
        const language = document.getElementById('languageSelect').value;
        const currency = document.getElementById('currencySelect').value;

        const settings = {
            emailNotifications,
            smsNotifications,
            language,
            currency
        };

        localStorage.setItem('userSettings', JSON.stringify(settings));
        showNotification('Настройки сохранены', 'success');
    }

    viewOrderDetails(orderId) {
        showNotification(`Детали заказа #${orderId} будут доступны после интеграции с API`, 'info');
    }

    removeFavorite(itemId) {
        showNotification('Товар удален из избранного', 'success');
        this.loadFavorites(); // Reload to show updated list
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
            this.currentUser = null;
            localStorage.removeItem('user');
            localStorage.removeItem('userSettings');
            this.updateUserInterface();
            showNotification('Вы успешно вышли из аккаунта', 'success');
            
            // Redirect to home page after logout
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }
}

// Initialize account when DOM is loaded
let account;
document.addEventListener('DOMContentLoaded', () => {
    account = new Account();
});
