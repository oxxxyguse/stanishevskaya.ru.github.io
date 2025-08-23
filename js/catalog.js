// Данные товаров (в реальном проекте загружаются с сервера)
const products = [
    {
        id: 1,
        name: "MacBook Pro 14\"",
        category: "laptops",
        brand: "apple",
        price: 189990,
        oldPrice: 199990,
        description: "Мощный ноутбук для профессионалов",
        image: "fas fa-laptop",
        inStock: true,
        isNew: true,
        rating: 4.9
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        category: "smartphones",
        brand: "apple",
        price: 89990,
        oldPrice: 105990,
        description: "Флагманский смартфон Apple",
        image: "fas fa-mobile-alt",
        inStock: true,
        isNew: false,
        rating: 4.8
    },
    {
        id: 3,
        name: "AirPods Pro 2",
        category: "accessories",
        brand: "apple",
        price: 24990,
        oldPrice: null,
        description: "Беспроводные наушники с шумоподавлением",
        image: "fas fa-headphones",
        inStock: true,
        isNew: false,
        rating: 4.7
    },
    {
        id: 4,
        name: "PlayStation 5",
        category: "gaming",
        brand: "sony",
        price: 54990,
        oldPrice: null,
        description: "Игровая консоль нового поколения",
        image: "fas fa-gamepad",
        inStock: false,
        isNew: false,
        rating: 4.9
    },
    {
        id: 5,
        name: "Samsung Galaxy S24",
        category: "smartphones",
        brand: "samsung",
        price: 79990,
        oldPrice: 89990,
        description: "Флагманский Android смартфон",
        image: "fas fa-mobile-alt",
        inStock: true,
        isNew: true,
        rating: 4.6
    },
    {
        id: 6,
        name: "ASUS ROG Strix",
        category: "laptops",
        brand: "asus",
        price: 129990,
        oldPrice: null,
        description: "Игровой ноутбук с RTX 4070",
        image: "fas fa-laptop",
        inStock: true,
        isNew: false,
        rating: 4.7
    },
    {
        id: 7,
        name: "iPad Pro 12.9\"",
        category: "tablets",
        brand: "apple",
        price: 99990,
        oldPrice: null,
        description: "Мощный планшет для профессионалов",
        image: "fas fa-tablet-alt",
        inStock: true,
        isNew: false,
        rating: 4.8
    },
    {
        id: 8,
        name: "Lenovo ThinkPad X1",
        category: "laptops",
        brand: "lenovo",
        price: 159990,
        oldPrice: 179990,
        description: "Бизнес-ноутбук премиум класса",
        image: "fas fa-laptop",
        inStock: true,
        isNew: false,
        rating: 4.6
    }
];

// Состояние каталога
let currentFilters = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 200000 },
    availability: []
};

let currentSort = 'popular';
let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 8;

// Инициализация каталога
document.addEventListener('DOMContentLoaded', function() {
    initFilters();
    initSorting();
    initViewToggle();
    initPagination();
    renderProducts();
});

// Инициализация фильтров
function initFilters() {
    // Обработчики для чекбоксов
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    // Обработчики для ценовых слайдеров
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const priceMinInput = document.getElementById('price-min-input');
    const priceMaxInput = document.getElementById('price-max-input');

    if (priceMin && priceMax) {
        priceMin.addEventListener('input', function() {
            currentFilters.priceRange.min = parseInt(this.value);
            priceMinInput.value = this.value;
            updateFilters();
        });

        priceMax.addEventListener('input', function() {
            currentFilters.priceRange.max = parseInt(this.value);
            priceMaxInput.value = this.value;
            updateFilters();
        });
    }

    if (priceMinInput && priceMaxInput) {
        priceMinInput.addEventListener('input', function() {
            currentFilters.priceRange.min = parseInt(this.value) || 0;
            priceMin.value = this.value;
            updateFilters();
        });

        priceMaxInput.addEventListener('change', function() {
            currentFilters.priceRange.max = parseInt(this.value) || 200000;
            priceMax.value = this.value;
            updateFilters();
        });
    }

    // Кнопки применения и сброса фильтров
    const applyBtn = document.querySelector('.apply-filters');
    const clearBtn = document.querySelector('.clear-filters');

    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
}

// Обновление фильтров
function updateFilters() {
    const categories = Array.from(document.querySelectorAll('input[value*="laptops"], input[value*="smartphones"], input[value*="tablets"], input[value*="accessories"], input[value*="gaming"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const brands = Array.from(document.querySelectorAll('input[value*="apple"], input[value*="samsung"], input[value*="sony"], input[value*="asus"], input[value*="lenovo"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const availability = Array.from(document.querySelectorAll('input[value*="in-stock"], input[value*="pre-order"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    currentFilters = {
        categories,
        brands,
        priceRange: currentFilters.priceRange,
        availability
    };

    currentPage = 1;
    renderProducts();
}

// Применение фильтров
function applyFilters() {
    renderProducts();
    showNotification('Фильтры применены', 'success');
}

// Сброс фильтров
function clearFilters() {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const priceMinInput = document.getElementById('price-min-input');
    const priceMaxInput = document.getElementById('price-max-input');

    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 200000;
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';

    currentFilters = {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 200000 },
        availability: []
    };

    currentPage = 1;
    renderProducts();
    showNotification('Фильтры сброшены', 'info');
}

// Инициализация сортировки
function initSorting() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1;
            renderProducts();
        });
    }
}

// Инициализация переключения вида
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderProducts();
        });
    });
}

// Инициализация пагинации
function initPagination() {
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageNumbers = document.querySelectorAll('.page-number');

    if (prevBtn) prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(currentPage + 1));

    pageNumbers.forEach((page, index) => {
        page.addEventListener('click', () => changePage(index + 1));
    });
}

// Смена страницы
function changePage(page) {
    if (page < 1 || page > getTotalPages()) return;
    
    currentPage = page;
    renderProducts();
    updatePagination();
}

// Обновление пагинации
function updatePagination() {
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((page, index) => {
        page.classList.toggle('active', index + 1 === currentPage);
    });
}

// Получение общего количества страниц
function getTotalPages() {
    const filteredProducts = getFilteredProducts();
    return Math.ceil(filteredProducts.length / itemsPerPage);
}

// Получение отфильтрованных товаров
function getFilteredProducts() {
    return products.filter(product => {
        // Фильтр по категориям
        if (currentFilters.categories.length > 0 && !currentFilters.categories.includes(product.category)) {
            return false;
        }

        // Фильтр по брендам
        if (currentFilters.brands.length > 0 && !currentFilters.brands.includes(product.brand)) {
            return false;
        }

        // Фильтр по цене
        if (product.price < currentFilters.priceRange.min || product.price > currentFilters.priceRange.max) {
            return false;
        }

        // Фильтр по наличию
        if (currentFilters.availability.length > 0) {
            if (currentFilters.availability.includes('in-stock') && !product.inStock) {
                return false;
            }
            if (currentFilters.availability.includes('pre-order') && product.inStock) {
                return false;
            }
        }

        return true;
    });
}

// Сортировка товаров
function sortProducts(products) {
    switch (currentSort) {
        case 'price-asc':
            return products.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return products.sort((a, b) => b.price - a.price);
        case 'new':
            return products.sort((a, b) => b.isNew - a.isNew);
        case 'name':
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case 'popular':
        default:
            return products.sort((a, b) => b.rating - a.rating);
    }
}

// Рендеринг товаров
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);
    const totalPages = getTotalPages();

    // Проверка текущей страницы
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    // Получение товаров для текущей страницы
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = sortedProducts.slice(startIndex, endIndex);

    // Очистка контейнера
    container.innerHTML = '';

    if (pageProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }

    // Рендеринг товаров
    pageProducts.forEach(product => {
        const productElement = createProductElement(product);
        container.appendChild(productElement);
    });

    // Обновление пагинации
    updatePagination();
}

// Создание элемента товара
function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.className = `product-card ${currentView === 'list' ? 'product-card-list' : ''}`;
    
    const badges = [];
    if (product.isNew) badges.push('<span class="badge new">Новинка</span>');
    if (product.oldPrice) badges.push('<span class="badge sale">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>');
    if (!product.inStock) badges.push('<span class="badge out-of-stock">Под заказ</span>');

    productDiv.innerHTML = `
        <div class="product-image">
            <div class="image-placeholder">
                <i class="${product.image}"></i>
            </div>
            <div class="product-badges">
                ${badges.join('')}
            </div>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
                <div class="stars">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                </div>
                <span class="rating-text">${product.rating}</span>
            </div>
            <div class="product-price">
                <span class="current-price">${product.price.toLocaleString()} ₽</span>
                ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
            </div>
            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                ${product.inStock ? 'В корзину' : 'Под заказ'}
            </button>
        </div>
    `;

    // Обработчик для кнопки добавления в корзину
    const addToCartBtn = productDiv.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(product);
    });

    return productDiv;
}

// Добавление в корзину
function addToCart(product) {
    // Получаем текущее количество товаров в корзине
    const cartCountElement = document.querySelector('.cart-count');
    let currentCount = parseInt(cartCountElement.textContent) || 0;
    
    // Увеличиваем счетчик
    currentCount++;
    cartCountElement.textContent = currentCount;
    
    // Анимация кнопки
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Добавлено!';
    btn.style.background = '#28a745';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
    
    showNotification(`"${product.name}" добавлен в корзину`, 'success');
}

// Стили для отсутствующих товаров
const noProductsStyles = `
    <style>
        .no-products {
            text-align: center;
            padding: 3rem;
            color: #cccccc;
        }
        
        .product-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .stars {
            color: #ffc107;
            font-size: 1.1rem;
        }
        
        .rating-text {
            color: #666;
            font-size: 0.9rem;
        }
        
        .badge.out-of-stock {
            background: #ffc107;
            color: #000;
        }
        
        .product-card-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .product-card-list .product-image {
            height: 150px;
        }
    </style>
`;

// Добавляем стили в head
document.head.insertAdjacentHTML('beforeend', noProductsStyles);
