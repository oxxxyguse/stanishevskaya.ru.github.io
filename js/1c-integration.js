// 1C Integration for Stanishevskaya Line
class OneCIntegration {
    constructor() {
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.syncStatus = 'idle'; // idle, running, success, error
        this.init();
    }

    init() {
        this.loadLastSyncTime();
        this.bindEvents();
        this.startAutoSync();
    }

    // Load last sync time from localStorage
    loadLastSyncTime() {
        this.lastSyncTime = localStorage.getItem('1c_last_sync');
        if (this.lastSyncTime) {
            this.lastSyncTime = new Date(this.lastSyncTime);
        }
    }

    // Bind integration events
    bindEvents() {
        // Manual sync button
        const syncButton = document.getElementById('1c-sync-btn');
        if (syncButton) {
            syncButton.addEventListener('click', () => this.startManualSync());
        }

        // Sync status display
        this.updateSyncStatus();
    }

    // Start automatic synchronization
    startAutoSync() {
        // Sync every 30 minutes
        this.syncInterval = setInterval(() => {
            this.startAutoSync();
        }, 30 * 60 * 1000);
    }

    // Start manual synchronization
    async startManualSync() {
        if (this.syncStatus === 'running') {
            this.showNotification('Синхронизация уже выполняется', 'info');
            return;
        }

        this.syncStatus = 'running';
        this.updateSyncStatus();

        try {
            // Show sync progress
            this.showSyncProgress();

            // Start 1C sync process
            const result = await this.performSync();

            if (result.success) {
                this.syncStatus = 'success';
                this.lastSyncTime = new Date();
                localStorage.setItem('1c_last_sync', this.lastSyncTime.toISOString());
                
                this.showNotification('Синхронизация с 1C завершена успешно', 'success');
                
                // Refresh product data
                await this.refreshProductData();
            } else {
                throw new Error(result.error || 'Ошибка синхронизации');
            }

        } catch (error) {
            this.syncStatus = 'error';
            this.showNotification('Ошибка синхронизации: ' + error.message, 'error');
            console.error('1C sync error:', error);
        } finally {
            this.updateSyncStatus();
            this.hideSyncProgress();
        }
    }

    // Perform actual 1C synchronization
    async performSync() {
        try {
            // Step 1: Get sync status from 1C
            const status = await api.get1CStatus();
            
            if (!status.available) {
                throw new Error('1C система недоступна');
            }

            // Step 2: Start sync process
            const syncResult = await api.syncWith1C();
            
            // Step 3: Wait for sync completion
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 5 minutes
            
            while (attempts < maxAttempts) {
                await this.delay(10000); // Wait 10 seconds
                
                const currentStatus = await api.get1CStatus();
                
                if (currentStatus.syncCompleted) {
                    return {
                        success: true,
                        productsUpdated: currentStatus.productsUpdated,
                        pricesUpdated: currentStatus.pricesUpdated,
                        stockUpdated: currentStatus.stockUpdated
                    };
                }
                
                if (currentStatus.syncError) {
                    throw new Error(currentStatus.syncError);
                }
                
                attempts++;
            }
            
            throw new Error('Превышено время ожидания синхронизации');
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Refresh product data after sync
    async refreshProductData() {
        try {
            // Refresh catalog products
            if (window.location.pathname.includes('catalog.html')) {
                const catalog = window.catalog;
                if (catalog && catalog.refreshProducts) {
                    await catalog.refreshProducts();
                }
            }

            // Refresh featured products on main page
            if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                await this.refreshFeaturedProducts();
            }

            // Refresh cart if needed
            const cart = window.cart;
            if (cart && cart.refreshCart) {
                await cart.refreshCart();
            }

        } catch (error) {
            console.warn('Failed to refresh product data:', error);
        }
    }

    // Refresh featured products on main page
    async refreshFeaturedProducts() {
        try {
            const products = await api.getProducts({ featured: true, limit: 8 });
            
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid && products.length > 0) {
                // Update product cards with new data
                this.updateProductCards(productsGrid, products);
            }
        } catch (error) {
            console.warn('Failed to refresh featured products:', error);
        }
    }

    // Update product cards with new data
    updateProductCards(container, products) {
        const productCards = container.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            if (products[index]) {
                const product = products[index];
                
                // Update product info
                const title = card.querySelector('h3');
                if (title) title.textContent = product.name;
                
                const description = card.querySelector('.product-description');
                if (description) description.textContent = product.description;
                
                const currentPrice = card.querySelector('.current-price');
                if (currentPrice) currentPrice.textContent = product.price + ' ₽';
                
                const oldPrice = card.querySelector('.old-price');
                if (oldPrice && product.oldPrice) {
                    oldPrice.textContent = product.oldPrice + ' ₽';
                    oldPrice.style.display = 'inline';
                } else if (oldPrice) {
                    oldPrice.style.display = 'none';
                }
                
                // Update badges
                const badges = card.querySelector('.product-badges');
                if (badges) {
                    badges.innerHTML = '';
                    if (product.isNew) {
                        badges.innerHTML += '<span class="badge new">Новинка</span>';
                    }
                    if (product.discount > 0) {
                        badges.innerHTML += `<span class="badge sale">-${product.discount}%</span>`;
                    }
                }
            }
        });
    }

    // Show sync progress
    showSyncProgress() {
        // Create progress overlay
        const overlay = document.createElement('div');
        overlay.className = 'sync-overlay';
        overlay.innerHTML = `
            <div class="sync-progress">
                <div class="sync-spinner"></div>
                <h3>Синхронизация с 1C</h3>
                <p>Пожалуйста, подождите...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Show overlay
        setTimeout(() => overlay.classList.add('show'), 100);
    }

    // Hide sync progress
    hideSyncProgress() {
        const overlay = document.querySelector('.sync-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Update sync status display
    updateSyncStatus() {
        const statusElement = document.getElementById('1c-sync-status');
        if (!statusElement) return;

        let statusText = '';
        let statusClass = '';

        switch (this.syncStatus) {
            case 'idle':
                statusText = 'Ожидание';
                statusClass = 'status-idle';
                break;
            case 'running':
                statusText = 'Выполняется...';
                statusClass = 'status-running';
                break;
            case 'success':
                statusText = 'Завершено';
                statusClass = 'status-success';
                break;
            case 'error':
                statusText = 'Ошибка';
                statusClass = 'status-error';
                break;
        }

        statusElement.textContent = statusText;
        statusElement.className = `sync-status ${statusClass}`;

        // Update last sync time
        const lastSyncElement = document.getElementById('1c-last-sync');
        if (lastSyncElement && this.lastSyncTime) {
            lastSyncElement.textContent = this.lastSyncTime.toLocaleString('ru-RU');
        }
    }

    // Get sync statistics
    async getSyncStats() {
        try {
            const stats = await api.get1CStatus();
            return {
                lastSync: this.lastSyncTime,
                productsCount: stats.productsCount || 0,
                pricesUpdated: stats.pricesUpdated || 0,
                stockUpdated: stats.stockUpdated || 0,
                nextSync: this.getNextSyncTime()
            };
        } catch (error) {
            console.error('Failed to get sync stats:', error);
            return null;
        }
    }

    // Calculate next sync time
    getNextSyncTime() {
        if (!this.lastSyncTime) return null;
        
        const nextSync = new Date(this.lastSyncTime);
        nextSync.setMinutes(nextSync.getMinutes() + 30);
        return nextSync;
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.auth && window.auth.showNotification) {
            window.auth.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Stop auto sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Get integration status
    getStatus() {
        return {
            syncStatus: this.syncStatus,
            lastSyncTime: this.lastSyncTime,
            autoSyncEnabled: !!this.syncInterval
        };
    }
}

// Create global 1C integration instance
const oneCIntegration = new OneCIntegration();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OneCIntegration;
}
