# ЛР2 — Snimu: взаимодействие с внешним API

Данилова Анастасия, K3439. Вариант 4: сервис для аренды недвижимости.

## Задание

Привязать вёрстку из ЛР1 к внешнему API средствами fetch/axios/xhr.
Сделать моковое API на JSON-сервере и подключить к нему авторизацию.

## Что сделано

Вместо данных, зашитых в разметку, все страницы теперь получают данные через `fetch`
из мокового API на `json-server` + `json-server-auth` (JWT-авторизация).

- **Вход / регистрация / выход** — `POST /login`, `POST /register`. Токен и пользователь
  сохраняются в `localStorage`, в шапке показывается имя и ссылка «Выйти».
  Страницы кабинета и сообщений без входа перекидывают на `login.html`.
- **Поиск** (`index.html`) — карточки строятся из `GET /properties`, фильтры передаются
  query-параметрами json-server: `type`, `city_like`, `pricePerMonth_gte`, `pricePerMonth_lte`.
- **Страница объекта** (`property.html?id=...`) — `GET /properties/:id`, карусель фото,
  условия; заявка на аренду (`POST /rentals`, сумма считается по датам);
  кнопка «Написать владельцу» находит или создаёт чат (`/chats`).
- **Личный кабинет** — вкладка «Я снимаю» (мои аренды со статусами),
  «Я сдаю» (мои объявления, заявки на мои объекты с кнопками «Одобрить» / «Отклонить» — `PATCH /rentals/:id`),
  добавление объекта через модалку (`POST /properties`).
- **Сообщения** — список диалогов, переписка, отправка сообщения (`POST /messages`),
  история сделок (где я арендатор и где владелец).

## Моковое API

Данные лежат в `db.json`: `users`, `properties`, `rentals`, `chats`, `messages`.
Связи через `propertyId`, `userId`, `chatId`, для подтягивания объекта используется `_expand=property`.

Права доступа задаются в `routes.json` (защищённые маршруты json-server-auth):

| Ресурс | Правило | Что значит |
|--------|---------|------------|
| `/users` | 600 | читать и менять может только сам пользователь |
| `/properties` | 644 | читать могут все, менять — только владелец |
| `/rentals`, `/chats`, `/messages` | 660 | только для залогиненных |

Все запросы идут через одну функцию `api()` в `js/api.js`: она добавляет заголовок
`Authorization: Bearer <token>`, при `401` разлогинивает (токен живёт 1 час) и превращает
ошибки сервера в `Error` с текстом, который показывается в форме.

```js
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = 'Bearer ' + token
  }
  const res = await fetch(API_URL + path, { ...options, headers })
  ...
}
```

Пользовательский текст перед вставкой в `innerHTML` экранируется (`escapeHtml` в `js/utils.js`).

## Запуск

```bash
npm install
npm run server   # API на http://localhost:3000
```

Страницы открывать через любой статический сервер, например Live Server в VS Code
или `python3 -m http.server 5500` и потом http://localhost:5500.

Тестовые пользователи (пароль у всех `123456`):

- anna@mail.ru
- irina@mail.ru
- oleg@mail.ru

## Структура

```
lr2/
├── index.html, property.html, login.html,
│   register.html, profile.html, messages.html
├── css/style.css
├── js/
│   ├── api.js        — обёртка над fetch
│   ├── auth.js       — вход, регистрация, выход, шапка
│   ├── utils.js      — форматирование цены/дат, статусы, escapeHtml
│   ├── search.js     — поиск и фильтры
│   ├── property.js   — страница объекта, заявка, чат
│   ├── profile.js    — личный кабинет
│   ├── messages.js   — сообщения и история сделок
│   ├── login.js, register.js
├── db.json           — данные мокового API
├── routes.json       — права доступа
└── package.json
```
