# Карта файлов

## Корень
- `CLAUDE.md` — правила работы с кодом для Claude Code.
- `PROJECT.md` — что строим, этапы, принятые решения, открытые вопросы.
- `STRUCTURE.md` — этот файл: строка на каждый файл проекта.
- `package.json` — монорепо (npm workspaces) и общие команды: build, start, lint, typecheck.
- `package-lock.json` — точные версии зависимостей (по нему `npm ci` на ПК).
- `tsconfig.base.json` — общие настройки TypeScript (strict) для всех пакетов.
- `eslint.config.js` — линтер, включая правило `max-lines: 400`.
- `.gitignore` / `.gitattributes` — что не в git; концы строк (`.ps1`/`.txt`/`.cmd` — CRLF для Windows).
- `start.cmd` — запуск сервера на ПК двойным щелчком (вызывает `scripts/start.ps1` в обход политики скриптов).
- `update.cmd` — обновление из GitHub двойным щелчком (вызывает `scripts/update.ps1`).
- `КАК_ОБНОВИТЬ.txt` — шпаргалка для ПК: обновление, запуск, скрытые страницы, ручной вариант команд.

## docs/
- `docs/SETUP_PC.txt` — пошаговая установка ПО на ПК с RTX 5090 (драйвер, Git, Node, Ollama, модель) со ссылками и проверками.
- `docs/GIT_PC.txt` — как клонировать проект на ПК, обновлять через `update.ps1` и отдавать дебаг.

## scripts/
- `scripts/start.ps1` — запуск на ПК: гасит старый gateway, проверяет Ollama, `npm ci` при первом запуске, сборка, старт.
- `scripts/update.ps1` — гасит работающий gateway → `git pull` → `npm ci` при смене lock-файла → печать версии → `start.ps1`.
- `scripts/check-lines.mjs` — лимит строк для CSS/HTML (ESLint их не видит).

## packages/shared/ — контракт между фронтом и gateway
- `package.json` — пакет `@strela/shared` (раздаёт TS-исходники напрямую).
- `src/index.ts` — реэкспорт всего пакета.
- `src/version.ts` — `APP_VERSION`, растёт при каждом изменении кода.
- `src/chat.ts` — типы запроса/ответа чата (с приложенным файлом) и событий SSE-потока (без рассуждений и данных о модели), `ChatStats`.
- `src/diag.ts` — типы ответа `/api/diag` (GPU, Ollama, последние запросы/ошибки).
- `src/admin.ts` — типы `/api/admin/requests`: вопрос, ответ, рассуждения, файл, сработавшая тема, замеры.
- `src/rules.ts` — типы тем админки: запрет / заготовка ответа, настройки проверки, результат проверки.

## apps/gateway/ — сервис на ПК с 5090 (Node + Hono, запуск через tsx)
- `package.json`, `tsconfig.json` — зависимости и настройки пакета.
- `.env.example` — пример настроек (HOST, PORT, OLLAMA_URL, MODEL, KEEP_ALIVE, THINK, NUM_CTX, GATEWAY_TOKEN).
- `src/index.ts` — точка входа: проверка токена, маршруты `/api/*`, раздача собранного фронта.
- `src/config.ts` — чтение `.env` и значения по умолчанию.
- `src/routes/chat.ts` — `POST /api/chat`: темы админки (запрет/заготовка) → скрытая инструкция → стрим из Ollama → SSE; файл вставляется в вопрос; рассуждения — только в админку.
- `src/routes/diag.ts` — `GET /api/diag`: снимок состояния для отладки.
- `src/routes/admin.ts` — `GET /api/admin/requests`: полные записи запросов; `GET/PUT /api/admin/rules` — темы; `POST /api/admin/rules/test` — проверить вопрос.
- `src/lib/ollama.ts` — запросы к API Ollama (версия, модели, что в памяти) и разбор NDJSON.
- `src/lib/gpu.ts` — состояние видеокарты через `nvidia-smi`.
- `src/lib/metrics.ts` — последние 50 запросов (с текстами и рассуждениями) и 20 ошибок в памяти.
- `src/lib/normalize.ts` — «сжатие» текста против обходов стоп-слов (латиница-двойники, точки, пробелы, повторы).
- `src/lib/rulesStore.ts` — темы админки в `data/rules.json` (не в git), значения по умолчанию, проверка формата.
- `src/lib/semanticCheck.ts` — слой 2: модель по смыслу относит вопрос к теме (JSON-ответ, без рассуждений).
- `src/lib/moderation.ts` — разбор вопроса по темам (слои 1–2) и скрытая инструкция модели: кто она, запреты, заготовка.
- `src/lib/thinkSplitter.ts` — вырезает `<think>…</think>` из потока ответа, даже если теги пришли по кускам.

## apps/web/ — фронт (React 19 + Vite)
- `package.json`, `tsconfig.json`, `vite.config.ts` — настройки; в dev `/api` проксируется на gateway.
- `index.html` — HTML-оболочка, мета-теги для iOS/Android.
- `public/favicon.svg` — иконка вкладки: белая стрелка на оранжевом (`#de6800`).
- `public/logo.png` — логотип «Стрела» (190×55, прозрачный фон), в шапке показывается в 28px высотой.
- `src/main.tsx` — вход: подключение стилей, журнала ошибок, рендер `App`.
- `src/app/App.tsx` — каркас: шапка (лого + «Машинный интеллект» + версия), шторка, настройки; скрытые экраны `#diag` и `#admin`.
- `src/shared/apiBase.ts` — базовый адрес API.
- `src/features/chat/ChatView.tsx` — экран чата: приветствие или лента, выбор модели, поле ввода.
- `src/features/chat/MessageList.tsx` — лента с автопрокруткой вниз.
- `src/features/chat/MessageBubble.tsx` — одно сообщение: markdown и ошибка (без данных о модели).
- `src/features/chat/TypingArrow.tsx` — индикатор ответа: стрелка вправо «натягивается» с подписью «Машинный интеллект думает…»; вниз и пульсирует, пока пишет.
- `src/features/chat/Composer.tsx` — поле ввода с авто-высотой, скрепка для файла, отправка/стоп.
- `src/features/chat/fileAttach.ts` — чтение текстового файла (UTF-8 / Windows-1251), лимиты размера.
- `src/features/chat/useChat.ts` — логика отправки и дописывания ответа по стриму.
- `src/features/chat/streamChat.ts` — fetch к `/api/chat` и разбор SSE.
- `src/features/history/historyStore.ts` — чтение/запись истории в localStorage, типы сообщений.
- `src/features/history/useConversations.ts` — список чатов, активный чат, отложенное сохранение.
- `src/features/history/Sidebar.tsx` — шторка за бургером (на всех экранах): новый чат, история, внизу «Настройки».
- `src/features/models/modelCatalog.ts` — наши названия моделей (МС 1.5 / МС 2 / МС 2 Фото), простые описания, какие доступны.
- `src/features/models/ModelPicker.tsx` — выбор модели над полем ввода; описание по наведению или двойному нажатию, заглушки серые.
- `src/features/settings/SettingsPanel.tsx` — настройки пользователя: тема, очистка истории, версия.
- `src/features/settings/themeStore.ts` — тема (авто/светлая/тёмная): хранение и установка `data-theme`.
- `src/features/admin/AdminPanel.tsx` — админка (`#admin`): вкладки «Запросы» и «Темы и ответы».
- `src/features/admin/RequestsTab.tsx` — журнал запросов: рассуждения, ответ, файл, сработавшая тема.
- `src/features/admin/RulesTab.tsx` — темы: переключатели проверок, список, «Сохранить».
- `src/features/admin/RuleCard.tsx` — одна тема: запрет или заготовка, описание, стоп-слова, текст.
- `src/features/admin/RuleTester.tsx` — «Проверить вопрос»: какая тема сработает.
- `src/features/admin/describeCheck.ts` — результат проверки человеческим языком.
- `src/features/admin/adminApi.ts` — запросы админки к gateway.
- `src/features/diag/DiagPanel.tsx` — окно диагностики с кнопкой «Скопировать дебаг».
- `src/features/diag/buildDebugText.ts` — сборка текстового дебаг-блока.
- `src/features/diag/clientLog.ts` — журнал ошибок браузера.
- `src/styles/tokens.css` — цвета/шрифты/размеры в стиле strela27.ru (бежевый фон, коричневый, оранжевый акцент; PT Sans / PT Sans Narrow из `@fontsource`, без Google Fonts).
- `src/styles/base.css` — сброс стилей, кнопки, `.visually-hidden` (текст для экранного диктора).
- `src/styles/layout.css` — каркас, шапка, боковая панель.
- `src/styles/chat.css` — сообщения, поле ввода, прикреплённый файл.
- `src/styles/markdown.css` — оформление markdown в ответах.
- `src/styles/diag.css` — окно диагностики.
- `src/styles/admin.css` — админ-панель: вкладки, карточки запросов.
- `src/styles/adminRules.css` — вкладка «Темы и ответы».
- `src/styles/typingArrow.css` — анимация стрелки-индикатора (думает / пишет).
- `src/styles/models.css` — меню выбора модели и окошко описания.
- `src/styles/settings.css` — окно настроек (на телефоне — лист снизу).
