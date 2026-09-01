# SpeakPlaneOne Backend

Бэкенд SpeakPlane: Express + PostgreSQL. Хранит «полотно» из связанных блоков-«стран» и авторизацию пользователей.

## Установка

```bash
npm install
```

## Настройка окружения

Создай `.env` в корне проекта (dotenv читает его из текущей рабочей директории):

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speakplaneone
DB_USER=postgres
DB_PASSWORD=postgres
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> Запускать сервер нужно из папки проекта (`speakPlaneOne`), иначе `.env` не подхватится.

## Запуск

```bash
# 1. Инициализация/обновление схемы БД (+ сид корневого блока)
node src/init-db.js

# 2. Сервер (dev с nodemon)
npm run dev
```

Проверка: `GET http://localhost:5000/health` → `{"status":"ok"}`.

## Тесты

```bash
npm test
```

## Модель данных

- `users` — пользователи (`email`, `password_hash`, `name`, `gender`, `age`, `role`)
- `refresh_tokens` — refresh-токены (ротация при обновлении)
- `blocks` — блоки-«страны»:
  - геометрия в мировых координатах `x/y/width/height` (ось Y вниз)
  - `parent_id` + `edge` — какой гранью (`north/south/east/west`) блок приклеен к родителю
  - `owner_id` — кто создал блок, `content` — текст (пишется один раз)
  - `capacity` — вычисляемая ёмкость текста: `floor(width×height / (8×14))`

## API

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Access-токен передаётся в теле запроса, refresh-токен — в httpOnly cookie.

### Blocks
- `GET /blocks?bbox=x1,y1,x2,y2` — список блоков (опционально по области)
- `GET /blocks/:id` — один блок
- `POST /blocks` — создать блок `{ x, y }` (авторизация; примагничивается к ближайшему блоку со свободной гранью)
- `PUT /blocks/:id` — записать текст `{ content }` (один раз, с проверкой `capacity`)
- `DELETE /blocks/:id` — удалить блок (только `admin`)

#### Пример: создать блок

```bash
# 1. Войти — получить accessToken
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
# → { "success": true, "data": { "accessToken": "...", ... } }

# 2. Создать блок в точке (250, 0)
curl -X POST http://localhost:5000/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"x":250,"y":0}'
# → { "success": true, "data": { "id": 2, "content": null, "parent_id": 1, "edge": "east", "capacity": ..., ... } }
```

### Profile
- `GET /profile`
- `PUT /profile` — обновить `name`/`gender`/`age`

### Права
- `guest` — смотреть блоки
- `user` — создавать блоки + записать свой блок один раз
- `admin` — удалять любые блоки

## Алгоритм роста («магнит»)

Клик по пустому месту `(x, y)` → поиск блоков в радиусе `SEARCH_RADIUS` → выбор ближайшего со свободной гранью → случайный размер без пересечений с другими блоками → приклеить блок. Грань, обращённая к родителю, занята; каждая грань принимает ровно один дочерний блок.
