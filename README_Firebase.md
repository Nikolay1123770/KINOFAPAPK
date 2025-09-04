# KINO_FAP — версия с Firebase (Auth + Firestore)

Эта сборка добавляет регистрацию/вход и синхронизацию «Избранного» через Firestore.
Если конфиг Firebase не заполнен, всё продолжит работать в локальном режиме (LocalStorage).

## Как включить Firebase
1. Создайте проект на https://console.firebase.google.com/
2. Добавьте веб‑приложение.
3. В разделе *Project settings → Your apps → SDK setup and configuration* скопируйте объект конфигурации.
4. Откройте `assets/js/firebase.js` и замените поля `YOUR_*` реальными значениями.
5. В консоли Firebase включите:
   - Authentication → Sign-in method → Email/Password (Enable)
   - Firestore Database → Create database (Production / Test mode — на ваше усмотрение)
6. Залейте сайт на хостинг по HTTPS (Firebase Hosting, Vercel, Netlify, GitHub Pages и т.п.).

## Что синхронизируется
- Профиль: отображается `displayName` и `email` из Firebase Auth.
- Избранное: `users/{uid}.favorites` (массив id фильмов) в Firestore.

## Важно
- Ключи Firebase на фронтенде видны пользователю — это нормально для Firebase. Защитить данные помогает Security Rules Firestore.
- Демо-каталог `data/movies.json` можно заменить на вызовы TMDb/Kinopoisk API. Помните, что ключ TMDb публичен на фронте — ограничьте домены в настройках и/или проксируйте через бэкенд.

## Запуск локально
- `python -m http.server 8080` и откройте `http://localhost:8080/`

## Kinopoisk API
Вместо `data/movies.json` теперь используется [kinopoisk.dev API](https://kinopoisk.dev/).
API-ключ уже встроен (`X-API-KEY`). При необходимости замените его в `app.js` и `movie.js`.
