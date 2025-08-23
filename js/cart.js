// Cart functionality
class Cart {
    constructor() {
        this.items = [];
        this.promoCode = null;
        this.discount = 0;
        this.shipping = 0;
        this.init();
    }

    init() {
        this.loadCart();
        this.renderCart();
        this.bindEvents();
        this.updateCartCount();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.renderCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.renderCart();
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const discountAmount = (subtotal * this.discount) / 100;
        return subtotal - discountAmount + this.shipping;
    }

    applyPromoCode(code) {
        // Simulate promo code validation
        const promoCodes = {
            'WELCOME10': 10,
            'SUMMER20': 20,
            'TECH15': 15
        };

        if (promoCodes[code.toUpperCase()]) {
            this.promoCode = code.toUpperCase();
            this.discount = promoCodes[code.toUpperCase()];
            this.renderCart();
            showNotification(`Промокод "${code.toUpperCase()}" применен! Скидка ${this.discount}%`, 'success');
            return true;
        } else {
            showNotification('Неверный промокод', 'error');
            return false;
        }
    }

    renderCart() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartEmpty = document.getElementById('cartEmpty');
        const itemsCount = document.querySelector('.items-count');
        const subtotal = document.getElementById('subtotal');
        const shipping = document.getElementById('shipping');
        const discount = document.getElementById('discount');
        const total = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const discountRow = document.getElementById('discountRow');

        if (this.items.length === 0) {
            cartItemsList.style.display = 'none';
            cartEmpty.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            cartItemsList.style.display = 'block';
            cartEmpty.style.display = 'none';
            checkoutBtn.disabled = false;
        }

        // Update items count
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        itemsCount.textContent = `${totalItems} ${this.getPluralForm(totalItems, 'товар', 'товара', 'товаров')}`;

        // Render cart items
        cartItemsList.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');

        // Update summary
        const subtotalValue = this.getSubtotal();
        const discountAmount = (subtotalValue * this.discount) / 100;
        const totalValue = this.getTotal();

        subtotal.textContent = `${this.formatPrice(subtotalValue)}`;
        shipping.textContent = `${this.formatPrice(this.shipping)}`;
        
        if (this.discount > 0) {
            discount.textContent = `-${this.formatPrice(discountAmount)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
        
        total.textContent = `${this.formatPrice(totalValue)}`;
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <i class="fas fa-laptop"></i>
                </div>
                
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-category">${item.category} • ${item.brand}</p>
                    <div class="cart-item-price">
                        <span class="current-price">${this.formatPrice(item.price)}</span>
                        ${item.oldPrice ? `<span class="old-price">${this.formatPrice(item.oldPrice)}</span>` : ''}
                    </div>
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="cart.updateQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn plus" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="cart-item-total">
                    <span>${this.formatPrice(item.price * item.quantity)}</span>
                </div>
                
                <button class="remove-item" onclick="cart.removeItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    bindEvents() {
        // Promo code application
        const applyPromoBtn = document.getElementById('applyPromo');
        const promoInput = document.getElementById('promoInput');

        applyPromoBtn.addEventListener('click', () => {
            const code = promoInput.value.trim();
            if (code) {
                this.applyPromoCode(code);
                promoInput.value = '';
            }
        });

        // Enter key for promo code
        promoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyPromoBtn.click();
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.addEventListener('click', () => {
            this.checkout();
        });
    }

    checkout() {
        if (this.items.length === 0) {
            showNotification('Корзина пуста', 'error');
            return;
        }

        // Simulate checkout process
        showNotification('Переход к оформлению заказа...', 'info');
        
        // In a real application, this would redirect to a checkout page
        // or open a checkout modal
        setTimeout(() => {
            showNotification('Функция оформления заказа будет доступна после интеграции с платежной системой', 'info');
        }, 2000);
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }

    getPluralForm(number, one, two, five) {
        const n = Math.abs(number);
        const n10 = n % 10;
        const n100 = n % 100;

        if (n100 >= 11 && n100 <= 19) {
            return five;
        }

        if (n10 === 1) {
            return one;
        }

        if (n10 >= 2 && n10 <= 4) {
            return two;
        }

        return five;
    }
}

// Initialize cart when DOM is loaded
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new Cart();
});

// Global function for cart operations (accessible from other scripts)
function addToCart(product) {
    if (cart) {
        cart.addItem(product);
    }
}
