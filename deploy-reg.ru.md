# Инструкция по развертыванию на reg.ru

## 📋 Подготовка к развертыванию

### 1. Проверка файлов проекта

Убедитесь, что все файлы проекта готовы:

```
✅ index.html - Главная страница
✅ pages/catalog.html - Каталог товаров
✅ pages/cart.html - Корзина покупок
✅ pages/account.html - Личный кабинет
✅ pages/brand.html - О бренде
✅ pages/product.html - Страница товара
✅ css/style.css - Основные стили
✅ css/responsive.css - Адаптивные стили
✅ js/main.js - Основная логика
✅ js/api.js - API интеграция
✅ js/auth.js - Система авторизации
✅ js/catalog.js - Функционал каталога
✅ js/cart.js - Функционал корзины
✅ js/account.js - Личный кабинет
✅ js/product.js - Страница товара
✅ js/1c-integration.js - Интеграция с 1C
✅ README.md - Документация
✅ .gitignore - Исключения Git
```

### 2. Настройка домена

В панели управления reg.ru:

1. **Добавьте домен** в разделе "Домены и поддомены"
2. **Настройте DNS записи**:
   ```
   A @ 185.178.208.XX (IP вашего хостинга)
   CNAME www @
   ```
3. **Включите SSL сертификат** для HTTPS

## 🚀 Загрузка файлов

### Способ 1: Через FTP

1. **Подключитесь к FTP** используя данные от reg.ru:
   - Хост: ftp.yourdomain.ru
   - Логин: ваш_логин
   - Пароль: ваш_пароль
   - Порт: 21

2. **Загрузите все файлы** в корневую папку сайта:
   ```
   public_html/
   ├── index.html
   ├── pages/
   ├── css/
   ├── js/
   ├── README.md
   └── .gitignore
   ```

### Способ 2: Через панель управления

1. **Откройте файловый менеджер** в панели reg.ru
2. **Создайте структуру папок**:
   - `pages/`
   - `css/`
   - `js/`
3. **Загрузите файлы** через веб-интерфейс

## ⚙️ Настройка хостинга

### 1. Версия PHP

Убедитесь, что используется **PHP 7.4+**:
- В панели управления → "Веб-серверы" → "Версия PHP"
- Выберите PHP 7.4 или выше

### 2. Настройка .htaccess

Создайте файл `.htaccess` в корне сайта:

```apache
# Включение сжатия
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Кэширование статических файлов
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Перенаправление на HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Убираем расширение .html
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^\.]+)$ $1.html [NC,L]

# Обработка ошибок
ErrorDocument 404 /pages/404.html
ErrorDocument 500 /pages/500.html
```

### 3. Настройка базы данных (если требуется)

В панели управления reg.ru:

1. **Создайте базу данных** MySQL
2. **Запишите данные подключения**:
   - Хост: localhost
   - База данных: your_db_name
   - Пользователь: your_username
   - Пароль: your_password

3. **Обновите конфигурацию** в `js/api.js`:
   ```javascript
   this.baseURL = 'https://yourdomain.ru/api';
   ```

## 🔧 Настройка API

### 1. Backend API

Если у вас есть backend API:

1. **Загрузите backend файлы** в папку `api/`
2. **Настройте маршруты** для всех endpoints
3. **Проверьте CORS настройки**

### 2. Тестовый режим

Для тестирования без backend:

1. **Откройте `js/api.js`**
2. **Закомментируйте реальные API вызовы**:
   ```javascript
   // Временно отключено для тестирования
   // return await this.request(`/products?${queryString}`);
   
   // Возвращаем тестовые данные
   return this.getMockData();
   ```

## 📱 Тестирование

### 1. Проверка основных страниц

Откройте в браузере:
- ✅ `https://yourdomain.ru/` - Главная страница
- ✅ `https://yourdomain.ru/pages/catalog.html` - Каталог
- ✅ `https://yourdomain.ru/pages/cart.html` - Корзина
- ✅ `https://yourdomain.ru/pages/account.html` - Личный кабинет
- ✅ `https://yourdomain.ru/pages/brand.html` - О бренде
- ✅ `https://yourdomain.ru/pages/product.html` - Товар

### 2. Проверка функциональности

- ✅ Поиск по сайту
- ✅ Фильтрация товаров
- ✅ Добавление в корзину
- ✅ Формы авторизации
- ✅ Адаптивность на мобильных

### 3. Проверка производительности

Используйте инструменты:
- **Google PageSpeed Insights**
- **GTmetrix**
- **WebPageTest**

## 🚨 Устранение проблем

### Ошибка 404

1. **Проверьте структуру папок**
2. **Убедитесь в правильности .htaccess**
3. **Проверьте права доступа к файлам**

### Ошибка 500

1. **Проверьте логи ошибок** в панели reg.ru
2. **Убедитесь в корректности PHP кода**
3. **Проверьте настройки сервера**

### Проблемы с SSL

1. **Активируйте SSL сертификат**
2. **Проверьте DNS записи**
3. **Подождите 24-48 часов** для распространения

## 📊 Мониторинг

### 1. Настройка аналитики

Добавьте в `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Yandex.Metrika -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(YOUR_COUNTER_ID, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
```

### 2. Мониторинг доступности

Настройте в панели reg.ru:
- **Мониторинг доступности** сайта
- **Уведомления** о недоступности
- **Автоматическое восстановление**

## 🔄 Обновления

### 1. Автоматические обновления

Настройте в панели reg.ru:
- **Автоматическое резервное копирование**
- **Обновление SSL сертификатов**
- **Мониторинг безопасности**

### 2. Ручные обновления

1. **Создайте резервную копию** текущей версии
2. **Загрузите новые файлы** через FTP
3. **Проверьте работоспособность**
4. **Откатитесь к резервной копии** при проблемах

## 📞 Поддержка

При возникновении проблем:

1. **Обратитесь в техподдержку reg.ru**
2. **Предоставьте логи ошибок**
3. **Опишите проблему подробно**
4. **Укажите версию браузера и ОС**

---

**Успешного развертывания! 🚀**
