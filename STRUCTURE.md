# Карта файлов

## Корень
- `CLAUDE.md` — правила работы с кодом для Claude Code.
- `PROJECT.md` — что строим, этапы, принятые решения, открытые вопросы.
- `STRUCTURE.md` — этот файл: строка на каждый файл проекта.
- `package.json` — монорепо (npm workspaces) и общие команды: build, start, lint, typecheck.
- `package-lock.json` — точные версии зависимостей (по нему `npm ci` на ПК).
- `tsconfig.base.json` — общие настройки TypeScript (strict) для всех пакетов.
- `eslint.config.js` — линтер, включая правило `max-lines: 400`.
- `.gitignore` / `.gitattributes` — что не в git; концы строк (`.ps1`/`.txt` — CRLF для Windows).

## docs/
- `docs/SETUP_PC.txt` — пошаговая установка ПО на ПК с RTX 5090 (драйвер, Git, Node, Ollama, модель) со ссылками и проверками.
- `docs/GIT_PC.txt` — как клонировать проект на ПК, обновлять через `update.ps1` и отдавать дебаг.

## scripts/
- `scripts/start.ps1` — запуск на ПК: гасит старый gateway, проверяет Ollama, `npm ci` при первом запуске, сборка, старт.
- `scripts/update.ps1` — `git pull` → `npm ci` при смене lock-файла → печать версии → `start.ps1`.
- `scripts/check-lines.mjs` — лимит строк для CSS/HTML (ESLint их не видит).

## packages/shared/ — контракт между фронтом и gateway
- `package.json` — пакет `@strela/shared` (раздаёт TS-исходники напрямую).
- `src/index.ts` — реэкспорт всего пакета.
- `src/version.ts` — `APP_VERSION`, растёт при каждом изменении кода.
- `src/chat.ts` — типы запроса/ответа чата и событий SSE-потока, `ChatStats`.
- `src/diag.ts` — типы ответа `/api/diag` (GPU, Ollama, последние запросы/ошибки).

## apps/gateway/ — сервис на ПК с 5090 (Node + Hono, запуск через tsx)
- `package.json`, `tsconfig.json` — зависимости и настройки пакета.
- `.env.example` — пример настроек (HOST, PORT, OLLAMA_URL, MODEL, KEEP_ALIVE, GATEWAY_TOKEN).
- `src/index.ts` — точка входа: проверка токена, маршруты `/api/*`, раздача собранного фронта.
- `src/config.ts` — чтение `.env` и значения по умолчанию.
- `src/routes/chat.ts` — `POST /api/chat`: стрим из Ollama → SSE, замер времени/скорости.
- `src/routes/diag.ts` — `GET /api/diag`: снимок состояния для отладки.
- `src/lib/ollama.ts` — запросы к API Ollama (версия, модели, что в памяти) и разбор NDJSON.
- `src/lib/gpu.ts` — состояние видеокарты через `nvidia-smi`.
- `src/lib/metrics.ts` — последние 20 запросов и ошибок в памяти.

## apps/web/ — фронт (React 19 + Vite)
- `package.json`, `tsconfig.json`, `vite.config.ts` — настройки; в dev `/api` проксируется на gateway.
- `index.html` — HTML-оболочка, мета-теги для iOS/Android.
- `public/favicon.svg` — иконка вкладки: белая стрелка на оранжевом (`#de6800`).
- `public/logo.png` — логотип «Стрела» (190×55, прозрачный фон), в шапке показывается в 28px высотой.
- `src/main.tsx` — вход: подключение стилей, журнала ошибок, рендер `App`.
- `src/app/App.tsx` — каркас: шапка (лого + версия), боковая панель, чат; скрытая диагностика по `#diag`.
- `src/shared/apiBase.ts` — базовый адрес API.
- `src/features/chat/ChatView.tsx` — экран чата: приветствие или лента + поле ввода.
- `src/features/chat/MessageList.tsx` — лента с автопрокруткой вниз.
- `src/features/chat/MessageBubble.tsx` — одно сообщение: markdown, ошибка, строка времени.
- `src/features/chat/Composer.tsx` — поле ввода с авто-высотой, отправка/стоп.
- `src/features/chat/useChat.ts` — логика отправки и дописывания ответа по стриму.
- `src/features/chat/streamChat.ts` — fetch к `/api/chat` и разбор SSE.
- `src/features/history/historyStore.ts` — чтение/запись истории в localStorage, типы сообщений.
- `src/features/history/useConversations.ts` — список чатов, активный чат, отложенное сохранение.
- `src/features/history/Sidebar.tsx` — боковая панель (на телефоне — шторка).
- `src/features/diag/DiagPanel.tsx` — окно диагностики с кнопкой «Скопировать дебаг».
- `src/features/diag/buildDebugText.ts` — сборка текстового дебаг-блока.
- `src/features/diag/clientLog.ts` — журнал ошибок браузера.
- `src/styles/tokens.css` — цвета/шрифты/размеры в стиле strela27.ru (бежевый фон, коричневый, оранжевый акцент; PT Sans / PT Sans Narrow из `@fontsource`, без Google Fonts).
- `src/styles/base.css` — сброс стилей, кнопки.
- `src/styles/layout.css` — каркас, шапка, боковая панель.
- `src/styles/chat.css` — сообщения и поле ввода.
- `src/styles/markdown.css` — оформление markdown в ответах.
- `src/styles/diag.css` — окно диагностики.
