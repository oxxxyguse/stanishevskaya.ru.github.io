// Фильтрация портфолио
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Обработчик клика по кнопкам фильтра
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Фильтруем элементы портфолио
            portfolioItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    // Анимация появления
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдение за элементами портфолио
    portfolioItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
    
    // Анимация для отзывов
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            observer.observe(card);
        }, index * 200);
    });
    
    // Обработчик для кнопок "Подробнее" в портфолио
    document.querySelectorAll('.portfolio-overlay .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const projectTitle = this.closest('.portfolio-overlay').querySelector('h3').textContent;
            showNotification(`Открывается проект: ${projectTitle}`, 'info');
        });
    });
    
    // Обработчик для кнопок фильтра с анимацией
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Добавляем эффект пульсации
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Плавная прокрутка к секции портфолио при клике на кнопки фильтра
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const portfolioSection = document.querySelector('.portfolio-content');
            if (portfolioSection) {
                portfolioSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Функция для показа статистики портфолио
function showPortfolioStats() {
    const stats = {
        total: 25,
        web: 10,
        mobile: 8,
        design: 4,
        branding: 3
    };
    
    // Создаем элемент статистики
    const statsElement = document.createElement('div');
    statsElement.className = 'portfolio-stats';
    statsElement.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Всего проектов</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.web}</div>
                <div class="stat-label">Веб-сайты</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.mobile}</div>
                <div class="stat-label">Мобильные приложения</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.design}</div>
                <div class="stat-label">Дизайн проекты</div>
            </div>
        </div>
    `;
    
    // Добавляем стили
    statsElement.style.cssText = `
        background: #f8f9fa;
        padding: 3rem 0;
        margin: 2rem 0;
    `;
    
    // Вставляем статистику перед секцией портфолио
    const portfolioSection = document.querySelector('.portfolio-content');
    if (portfolioSection) {
        portfolioSection.parentNode.insertBefore(statsElement, portfolioSection);
    }
}

// Вызываем функцию статистики при загрузке страницы
window.addEventListener('load', showPortfolioStats);
