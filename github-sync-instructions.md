# Инструкции по синхронизации с GitHub

## ✅ Статус: Синхронизация завершена

Проект Stanishevskaya Line успешно синхронизирован с GitHub репозиторием:
**https://github.com/oxxxyguse/stanishevskaya.ru.github.io.git**

## 🔄 Команды для ежедневной работы

### 1. Получение последних изменений
```bash
git pull origin main
```

### 2. Добавление изменений
```bash
git add .
git commit -m "Описание изменений"
```

### 3. Отправка изменений
```bash
git push origin main
```

### 4. Проверка статуса
```bash
git status
git log --oneline -10
```

## 📁 Структура репозитория

```
stanishevskaya.ru.github.io/
├── index.html              # Главная страница
├── css/                    # Стили
├── js/                     # JavaScript файлы
├── pages/                  # Страницы сайта
├── backend/                # Backend API
├── testing/                # Система тестирования
├── README.md               # Документация проекта
├── .htaccess              # Настройки Apache
└── .gitignore             # Исключения Git
```

## 🚀 GitHub Pages

Репозиторий настроен для автоматического развертывания на GitHub Pages:

- **URL**: https://oxxxyguse.github.io/stanishevskaya.ru.github.io/
- **Ветка**: main
- **Папка**: / (root)

## 🔧 Настройка автоматической синхронизации

### GitHub Actions (опционально)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 📝 Правила коммитов

### Формат сообщений коммитов:
```
тип(область): краткое описание

Примеры:
feat(frontend): добавить страницу корзины
fix(backend): исправить ошибку аутентификации
docs(readme): обновить документацию
style(css): улучшить стили кнопок
refactor(js): переписать модуль API
test(testing): добавить тесты производительности
```

### Типы коммитов:
- `feat` - новая функция
- `fix` - исправление ошибки
- `docs` - документация
- `style` - форматирование кода
- `refactor` - рефакторинг
- `test` - тесты
- `chore` - технические задачи

## 🚨 Важные замечания

1. **Не коммитьте конфиденциальные данные** (.env файлы, пароли, API ключи)
2. **Всегда делайте pull перед push** для избежания конфликтов
3. **Используйте описательные сообщения коммитов**
4. **Создавайте ветки для крупных изменений**

## 🔗 Полезные ссылки

- [GitHub Pages Documentation](https://pages.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📞 Поддержка

При возникновении проблем с синхронизацией:
1. Проверьте статус: `git status`
2. Проверьте логи: `git log --oneline -10`
3. Проверьте удаленный репозиторий: `git remote -v`
4. При необходимости сбросьте изменения: `git reset --hard HEAD`
