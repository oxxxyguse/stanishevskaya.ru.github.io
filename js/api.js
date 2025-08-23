// API configuration and methods
class API {
    constructor() {
        this.baseURL = 'https://api.stanishevskaya.ru'; // Замените на ваш реальный API endpoint
        this.apiKey = null;
        this.isAuthenticated = false;
    }

    // Set authentication token
    setAuthToken(token) {
        this.apiKey = token;
        this.isAuthenticated = true;
        localStorage.setItem('authToken', token);
    }

    // Get authentication token from localStorage
    getAuthToken() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('authToken');
            this.isAuthenticated = !!this.apiKey;
        }
        return this.apiKey;
    }

    // Clear authentication
    clearAuth() {
        this.apiKey = null;
        this.isAuthenticated = false;
        localStorage.removeItem('authToken');
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuth();
                    throw new Error('Unauthorized - please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Products API methods
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/products?${queryString}`);
    }

    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    async getProductCategories() {
        return await this.request('/categories');
    }

    async searchProducts(query, params = {}) {
        const searchParams = { q: query, ...params };
        const queryString = new URLSearchParams(searchParams).toString();
        return await this.request(`/products/search?${queryString}`);
    }

    // Cart API methods
    async getCart() {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to access cart');
        }
        return await this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to add to cart');
        }
        return await this.request('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(itemId, quantity) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to update cart');
        }
        return await this.request(`/cart/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async removeFromCart(itemId) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to remove from cart');
        }
        return await this.request(`/cart/items/${itemId}`, {
            method: 'DELETE'
        });
    }

    async applyPromoCode(code) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to apply promo code');
        }
        return await this.request('/cart/promo', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }

    // User authentication API methods
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setAuthToken(response.token);
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        if (this.isAuthenticated) {
            try {
                await this.request('/auth/logout', { method: 'POST' });
            } catch (error) {
                console.warn('Logout request failed:', error);
            }
        }
        this.clearAuth();
    }

    async getCurrentUser() {
        if (!this.isAuthenticated) {
            return null;
        }
        return await this.request('/auth/me');
    }

    async updateProfile(userData) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to update profile');
        }
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Orders API methods
    async getOrders() {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to access orders');
        }
        return await this.request('/orders');
    }

    async getOrder(orderId) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to access order');
        }
        return await this.request(`/orders/${orderId}`);
    }

    async createOrder(orderData) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to create order');
        }
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    // Favorites API methods
    async getFavorites() {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to access favorites');
        }
        return await this.request('/favorites');
    }

    async addToFavorites(productId) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to add to favorites');
        }
        return await this.request('/favorites', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    }

    async removeFromFavorites(productId) {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to remove from favorites');
        }
        return await this.request(`/favorites/${productId}`, {
            method: 'DELETE'
        });
    }

    // 1C Integration API methods
    async syncWith1C() {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to sync with 1C');
        }
        return await this.request('/1c/sync', { method: 'POST' });
    }

    async get1CStatus() {
        if (!this.isAuthenticated) {
            throw new Error('User must be authenticated to check 1C status');
        }
        return await this.request('/1c/status');
    }

    // Error handling
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('Unauthorized')) {
            // Redirect to login page
            window.location.href = '/pages/account.html?tab=login';
            return;
        }
        
        // Show user-friendly error message
        this.showNotification(error.message, 'error');
    }

    // Show notification (can be overridden by UI components)
    showNotification(message, type = 'info') {
        // Default implementation - can be overridden
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Create global API instance
const api = new API();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
