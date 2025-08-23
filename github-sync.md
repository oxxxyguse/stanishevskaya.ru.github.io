# Синхронизация с GitHub

## 📋 Подготовка к синхронизации

### 1. Проверка файлов проекта

Убедитесь, что все файлы готовы к коммиту:

```bash
# Проверка статуса Git
git status

# Должны быть готовы:
✅ index.html
✅ pages/
✅ css/
✅ js/
✅ README.md
✅ .gitignore
✅ .htaccess
✅ deploy-reg.ru.md
✅ github-sync.md
```

### 2. Настройка Git (если не настроен)

```bash
# Настройка пользователя
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Проверка настроек
git config --list
```

## 🚀 Первоначальная настройка репозитория

### 1. Инициализация Git

```bash
# Перейдите в папку проекта
cd /path/to/stanishevskaya.ru.github.io

# Инициализация Git репозитория
git init

# Добавление удаленного репозитория
git remote add origin https://github.com/oxxxyguse/stanishevskaya.ru.github.io.git

# Проверка удаленного репозитория
git remote -v
```

### 2. Первый коммит

```bash
# Добавление всех файлов
git add .

# Создание первого коммита
git commit -m "Initial commit: TechStore интернет-магазин

- Главная страница с hero слайдером
- Каталог товаров с фильтрацией и сортировкой
- Корзина покупок
- Личный кабинет с авторизацией
- Страница о бренде
- Детальная страница товара
- API интеграция
- Система авторизации
- Интеграция с 1C
- Адаптивный дизайн
- SEO оптимизация"

# Пуш в основную ветку
git push -u origin main
```

## 📁 Структура коммитов

### Рекомендуемая структура коммитов:

```bash
# Основная функциональность
git commit -m "feat: Добавлена главная страница с hero слайдером"
git commit -m "feat: Создан каталог товаров с фильтрацией"
git commit -m "feat: Реализована корзина покупок"
git commit -m "feat: Добавлен личный кабинет пользователя"
git commit -m "feat: Создана страница о бренде"
git commit -m "feat: Добавлена детальная страница товара"

# API и интеграции
git commit -m "feat: Интеграция с backend API"
git commit -m "feat: Система авторизации пользователей"
git commit -m "feat: Интеграция с 1C для синхронизации"

# Стили и UI
git commit -m "style: Темная минималистичная тема"
git commit -m "style: Адаптивный дизайн для всех устройств"
git commit -m "style: Анимации и переходы"

# Оптимизация
git commit -m "perf: Оптимизация производительности"
git commit -m "seo: Настройка для поисковых систем"
git commit -m "security: Заголовки безопасности"

# Документация
git commit -m "docs: README с описанием проекта"
git commit -m "docs: Инструкция по развертыванию на reg.ru"
git commit -m "docs: Инструкция по синхронизации с GitHub"
```

## 🔄 Ежедневная работа с репозиторием

### 1. Получение изменений

```bash
# Проверка изменений на сервере
git fetch origin

# Просмотр изменений
git log HEAD..origin/main --oneline

# Получение изменений
git pull origin main
```

### 2. Внесение изменений

```bash
# Создание новой ветки для изменений
git checkout -b feature/new-feature

# Внесение изменений в файлы
# ...

# Добавление изменений
git add .

# Коммит изменений
git commit -m "feat: Описание нового функционала"

# Пуш изменений
git push origin feature/new-feature
```

### 3. Слияние изменений

```bash
# Переключение на основную ветку
git checkout main

# Получение последних изменений
git pull origin main

# Слияние с вашей веткой
git merge feature/new-feature

# Пуш в основную ветку
git push origin main

# Удаление временной ветки
git branch -d feature/new-feature
```

## 🌐 Настройка GitHub Pages

### 1. Включение GitHub Pages

1. **Откройте репозиторий** на GitHub
2. **Перейдите в Settings** → Pages
3. **Выберите Source**: Deploy from a branch
4. **Выберите Branch**: main
5. **Выберите Folder**: / (root)
6. **Нажмите Save**

### 2. Проверка доступности

После настройки сайт будет доступен по адресу:
```
https://oxxxyguse.github.io/stanishevskaya.ru.github.io/
```

### 3. Настройка домена (опционально)

Если у вас есть собственный домен:

1. **Добавьте домен** в поле Custom domain
2. **Создайте файл CNAME** в корне репозитория:
   ```
   yourdomain.com
   ```
3. **Настройте DNS записи**:
   ```
   CNAME yourdomain.com oxxxyguse.github.io
   ```

## 🔧 Автоматизация с GitHub Actions

### 1. Создание workflow файла

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install -g http-server
        
    - name: Build project
      run: |
        echo "Building project..."
        # Здесь можно добавить команды сборки
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

### 2. Настройка секретов

В настройках репозитория → Secrets and variables → Actions:
- `GITHUB_TOKEN` - автоматически доступен

## 📊 Мониторинг и аналитика

### 1. GitHub Insights

- **Traffic**: Просмотры и клоны репозитория
- **Contributors**: Участники проекта
- **Commits**: История изменений
- **Releases**: Версии проекта

### 2. GitHub Actions

- **Workflow runs**: Статус автоматических развертываний
- **Artifacts**: Результаты сборки
- **Logs**: Детальные логи выполнения

## 🚨 Устранение проблем

### Конфликты при слиянии

```bash
# Проверка конфликтов
git status

# Разрешение конфликтов в файлах
# ...

# Добавление разрешенных файлов
git add .

# Завершение слияния
git commit -m "Merge: Разрешение конфликтов"
```

### Откат изменений

```bash
# Откат последнего коммита
git reset --hard HEAD~1

# Откат к определенному коммиту
git reset --hard <commit-hash>

# Откат изменений в файле
git checkout -- filename
```

### Восстановление удаленной ветки

```bash
# Просмотр удаленных веток
git branch -r

# Восстановление ветки
git checkout -b branch-name origin/branch-name
```

## 📋 Чек-лист перед пушем

- [ ] Все файлы добавлены в Git
- [ ] Тесты пройдены (если есть)
- [ ] Код проверен на ошибки
- [ ] Коммит имеет понятное описание
- [ ] Нет конфликтов с основной веткой
- [ ] Документация обновлена

## 🔄 Регулярные задачи

### Еженедельно:
- [ ] Проверка статуса репозитория
- [ ] Обновление зависимостей
- [ ] Проверка безопасности

### Ежемесячно:
- [ ] Анализ активности репозитория
- [ ] Обновление документации
- [ ] Проверка производительности

### Ежеквартально:
- [ ] Аудит безопасности
- [ ] Обновление технологий
- [ ] Планирование новых функций

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте документацию** GitHub
2. **Используйте GitHub Issues** для багов
3. **Обратитесь в поддержку** GitHub
4. **Изучите логи** GitHub Actions

---

**Успешной работы с GitHub! 🚀**
