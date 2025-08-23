// Product detail functionality
class ProductDetail {
    constructor() {
        this.currentImageIndex = 0;
        this.quantity = 1;
        this.currentTab = 'description';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initImageGallery();
        this.initTabs();
        this.initQuantityControls();
    }

    bindEvents() {
        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }

        // Favorite button
        const favoriteBtn = document.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Related products add to cart
        const relatedAddToCartBtns = document.querySelectorAll('.related-products .add-to-cart');
        relatedAddToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.addRelatedToCart(e));
        });

        // Load more reviews
        const loadMoreBtn = document.querySelector('.load-more-reviews');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreReviews());
        }
    }

    initImageGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.querySelector('.main-image .image-placeholder');

        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                this.switchImage(index);
            });
        });
    }

    switchImage(index) {
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });

        // Update main image (in real app, this would change the actual image)
        this.currentImageIndex = index;
        
        // Simulate image change
        const mainImage = document.querySelector('.main-image .image-placeholder i');
        const imageText = document.querySelector('.main-image .image-placeholder p');
        
        const images = [
            { icon: 'fas fa-laptop', text: 'MacBook Pro M2 - Вид спереди' },
            { icon: 'fas fa-laptop', text: 'MacBook Pro M2 - Вид сбоку' },
            { icon: 'fas fa-laptop', text: 'MacBook Pro M2 - Вид сзади' },
            { icon: 'fas fa-laptop', text: 'MacBook Pro M2 - Дисплей' }
        ];

        if (images[index]) {
            mainImage.className = images[index].icon;
            imageText.textContent = images[index].text;
        }
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;
    }

    initQuantityControls() {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.querySelector('.quantity-selector input');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => this.changeQuantity(-1));
            plusBtn.addEventListener('click', () => this.changeQuantity(1));
            quantityInput.addEventListener('change', (e) => this.setQuantity(parseInt(e.target.value)));
        }
    }

    changeQuantity(delta) {
        const newQuantity = this.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 15) {
            this.quantity = newQuantity;
            this.updateQuantityDisplay();
        }
    }

    setQuantity(quantity) {
        if (quantity >= 1 && quantity <= 15) {
            this.quantity = quantity;
            this.updateQuantityDisplay();
        } else {
            this.updateQuantityDisplay(); // Reset to current value
        }
    }

    updateQuantityDisplay() {
        const quantityInput = document.querySelector('.quantity-selector input');
        if (quantityInput) {
            quantityInput.value = this.quantity;
        }
    }

    addToCart() {
        const product = {
            id: 1,
            name: 'MacBook Pro M2 14" 512GB SSD',
            price: 249990,
            image: 'fas fa-laptop',
            category: 'Ноутбуки',
            brand: 'Apple'
        };

        // Add to cart with quantity
        for (let i = 0; i < this.quantity; i++) {
            if (typeof addToCart === 'function') {
                addToCart(product);
            }
        }

        // Show success message
        this.showNotification(`Добавлено в корзину: ${this.quantity} шт.`, 'success');
        
        // Animate button
        const btn = document.querySelector('.add-to-cart-btn');
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 1000);
    }

    toggleFavorite() {
        const favoriteBtn = document.querySelector('.favorite-btn');
        const icon = favoriteBtn.querySelector('i');
        
        if (favoriteBtn.classList.contains('favorited')) {
            favoriteBtn.classList.remove('favorited');
            icon.className = 'fas fa-heart';
            this.showNotification('Убрано из избранного', 'info');
        } else {
            favoriteBtn.classList.add('favorited');
            icon.className = 'fas fa-heart';
            this.showNotification('Добавлено в избранное', 'success');
        }
    }

    addRelatedToCart(event) {
        const productCard = event.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.current-price').textContent;
        
        this.showNotification(`Добавлено в корзину: ${productName}`, 'success');
        
        // Animate button
        const btn = event.target;
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 1000);
    }

    loadMoreReviews() {
        const loadMoreBtn = document.querySelector('.load-more-reviews');
        const reviewsList = document.querySelector('.reviews-list');
        
        // Simulate loading more reviews
        loadMoreBtn.textContent = 'Загрузка...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            const newReviews = [
                {
                    name: 'Дмитрий В.',
                    rating: 5,
                    date: '10.01.2024',
                    text: 'Превзошел все ожидания! Скорость работы просто невероятная. Идеально подходит для моей работы с видео.'
                },
                {
                    name: 'Елена М.',
                    rating: 5,
                    date: '08.01.2024',
                    text: 'Отличный выбор для дизайнера. Цветопередача дисплея потрясающая, производительность на высоте.'
                }
            ];

            newReviews.forEach(review => {
                const reviewHTML = this.createReviewHTML(review);
                reviewsList.insertAdjacentHTML('beforeend', reviewHTML);
            });

            loadMoreBtn.textContent = 'Загрузить еще отзывы';
            loadMoreBtn.disabled = false;
            
            this.showNotification('Загружено 2 новых отзыва', 'success');
        }, 1500);
    }

    createReviewHTML(review) {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="reviewer-details">
                            <h4>${review.name}</h4>
                            <div class="review-rating">
                                ${stars}
                            </div>
                        </div>
                    </div>
                    <span class="review-date">${review.date}</span>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            if (type === 'success') {
                notification.style.background = '#00ff88';
            } else if (type === 'error') {
                notification.style.background = '#ff4444';
            } else {
                notification.style.background = '#00d4ff';
            }

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Initialize product detail when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductDetail();
});
