# Stanishevskaya Line Backend API

Backend API для интернет-магазина Stanishevskaya Line, построенный на Node.js, Express и MongoDB.

## 🚀 Возможности

- **Аутентификация и авторизация** - JWT токены, роли пользователей
- **Управление продуктами** - CRUD операции, поиск, фильтрация
- **Корзина покупок** - добавление, удаление, обновление товаров
- **Заказы** - создание, отслеживание, история
- **Пользователи** - профили, настройки, адреса
- **Категории** - иерархическая структура товаров
- **1C интеграция** - синхронизация с системой 1С
- **Поиск** - полнотекстовый поиск по товарам
- **Безопасность** - валидация, rate limiting, CORS, Helmet
- **API документация** - Swagger/OpenAPI

## 🛠 Технологии

- **Node.js** - среда выполнения
- **Express.js** - веб-фреймворк
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей
- **express-validator** - валидация данных
- **helmet** - безопасность
- **cors** - CORS настройки
- **compression** - сжатие ответов
- **morgan** - логирование
- **winston** - расширенное логирование

## 📁 Структура проекта

```
backend/
├── models/              # Модели данных MongoDB
│   ├── User.js         # Модель пользователя
│   ├── Product.js      # Модель продукта
│   ├── Category.js     # Модель категории
│   ├── Order.js        # Модель заказа
│   └── Cart.js         # Модель корзины
├── routes/              # API роуты
│   ├── auth.js         # Аутентификация
│   ├── products.js     # Продукты
│   ├── categories.js   # Категории
│   ├── cart.js         # Корзина
│   ├── orders.js       # Заказы
│   ├── users.js        # Пользователи
│   ├── search.js       # Поиск
│   └── 1c-integration.js # 1C интеграция
├── middleware/          # Middleware функции
│   ├── auth.js         # Аутентификация
│   ├── validation.js   # Валидация
│   └── upload.js       # Загрузка файлов
├── utils/               # Утилиты
│   ├── database.js     # Подключение к БД
│   ├── logger.js       # Логирование
│   └── helpers.js      # Вспомогательные функции
├── config/              # Конфигурация
│   ├── database.js     # Настройки БД
│   └── security.js     # Настройки безопасности
├── scripts/             # Скрипты
│   ├── migrate.js      # Миграции БД
│   └── seed.js         # Заполнение тестовыми данными
├── tests/               # Тесты
├── logs/                # Логи
├── uploads/             # Загруженные файлы
├── server.js            # Основной сервер
├── package.json         # Зависимости
├── config.env.example   # Пример конфигурации
└── README.md            # Документация
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

Скопируйте файл конфигурации и настройте переменные:

```bash
cp config.env.example .env
```

Отредактируйте `.env` файл с вашими настройками.

### 3. Запуск MongoDB

Убедитесь, что MongoDB запущена:

```bash
# Локально
mongod

# Или используйте MongoDB Atlas
```

### 4. Запуск сервера

```bash
# Режим разработки
npm run dev

# Продакшн режим
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

## 📚 API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение профиля
- `PUT /api/auth/profile` - Обновление профиля
- `PUT /api/auth/password` - Смена пароля
- `POST /api/auth/forgot-password` - Забыли пароль
- `POST /api/auth/reset-password` - Сброс пароля

### Продукты

- `GET /api/products` - Список продуктов с фильтрацией
- `GET /api/products/featured` - Избранные продукты
- `GET /api/products/new` - Новые продукты
- `GET /api/products/bestsellers` - Бестселлеры
- `GET /api/products/search` - Поиск продуктов
- `GET /api/products/:id` - Продукт по ID
- `GET /api/products/slug/:slug` - Продукт по slug
- `POST /api/products` - Создание продукта (Admin/Moderator)
- `PUT /api/products/:id` - Обновление продукта (Admin/Moderator)
- `DELETE /api/products/:id` - Удаление продукта (Admin)

### Корзина

- `GET /api/cart` - Получение корзины
- `POST /api/cart/items` - Добавление товара в корзину
- `PUT /api/cart/items/:id` - Обновление количества
- `DELETE /api/cart/items/:id` - Удаление товара из корзины
- `POST /api/cart/promo` - Применение промокода

### Заказы

- `GET /api/orders` - История заказов
- `GET /api/orders/:id` - Детали заказа
- `POST /api/orders` - Создание заказа
- `PUT /api/orders/:id/status` - Обновление статуса

### Пользователи

- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновление профиля
- `GET /api/users/orders` - Заказы пользователя
- `GET /api/users/favorites` - Избранные товары

### 1C Интеграция

- `POST /api/1c/sync` - Синхронизация с 1С
- `GET /api/1c/status` - Статус синхронизации
- `GET /api/1c/products` - Продукты из 1С

## 🔐 Аутентификация

API использует JWT токены для аутентификации. Добавьте заголовок:

```
Authorization: Bearer <your-jwt-token>
```

### Роли пользователей

- **user** - Обычный пользователь
- **moderator** - Модератор (может управлять продуктами)
- **admin** - Администратор (полный доступ)

## 📊 База данных

### MongoDB Collections

- **users** - Пользователи системы
- **products** - Товары магазина
- **categories** - Категории товаров
- **orders** - Заказы пользователей
- **cart** - Корзины пользователей
- **reviews** - Отзывы на товары

### Индексы

- Текстовый поиск по названию и описанию товаров
- Индексы по категориям, брендам, статусам
- Уникальные индексы по email, SKU, slug

## 🛡️ Безопасность

- **Helmet** - Заголовки безопасности
- **CORS** - Настройки кросс-доменных запросов
- **Rate Limiting** - Ограничение частоты запросов
- **Input Validation** - Валидация входных данных
- **JWT** - Безопасная аутентификация
- **bcrypt** - Хеширование паролей

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск тестов в режиме watch
npm run test:watch

# Покрытие кода тестами
npm run test:coverage
```

## 📝 Логирование

Используется Winston для логирования:

- **Console** - В режиме разработки
- **File** - В продакшн режиме
- **Levels** - error, warn, info, debug

## 🚀 Развертывание

### Локальная разработка

```bash
npm run dev
```

### Продакшн

```bash
npm start
```

### Docker

```bash
docker build -t stanishevskaya-backend .
docker run -p 3000:3000 stanishevskaya-backend
```

## 🔧 Конфигурация

### Переменные окружения

- `NODE_ENV` - Окружение (development/production)
- `PORT` - Порт сервера
- `MONGODB_URI` - URI подключения к MongoDB
- `JWT_SECRET` - Секретный ключ для JWT
- `FRONTEND_URL` - URL фронтенда для CORS

### Настройки безопасности

- Rate limiting: 100 запросов в 15 минут
- Auth rate limiting: 5 запросов в 15 минут
- Login rate limiting: 3 попытки в 15 минут
- JWT expiration: 7 дней
- Password requirements: минимум 6 символов

## 📈 Мониторинг

- **Health Check** - `/api/health`
- **Metrics** - Основные метрики API
- **Error Tracking** - Логирование ошибок
- **Performance** - Время ответа API

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

- **Email**: support@stanishevskaya.ru
- **GitHub Issues**: [Создать issue](https://github.com/your-repo/issues)
- **Документация**: [API Docs](https://docs.stanishevskaya.ru)

## 🔄 Обновления

### v1.0.0
- Базовая функциональность API
- Аутентификация и авторизация
- Управление продуктами и заказами
- 1C интеграция

### Планы развития
- GraphQL API
- WebSocket для real-time уведомлений
- Микросервисная архитектура
- Kubernetes развертывание
