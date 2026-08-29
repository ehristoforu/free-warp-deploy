# Free WARP Deploy

[![License](https://img.shields.io/badge/license-gpl--3.0-brightgreen?style=for-the-badge)](LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge)](https://www.typescriptlang.org/) [![Warp](https://img.shields.io/badge/cloudflare-warp-orange?style=for-the-badge&logo=cloudflare)](https://one.one.one.one/) [![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/ehristoforu/free-warp-deploy) [![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)](https://app.netlify.com/start/deploy?repository=https://github.com/ehristoforu/free-warp-deploy)

Бесплатный веб-инструмент для генерации конфигурации WARP WireGuard для защищённого подключения. VPS, база данных, платный API и администрирование собственного сервера не требуются. Vercel и Netlify запускают только API генерации конфигурации и не являются узлами передачи трафика.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ehristoforu/free-warp-deploy) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ehristoforu/free-warp-deploy)

## Возможности

- Stateless-генерация через адаптеры Vercel и Netlify
- Генерация ключей X25519 и конфигурации WireGuard
- Копирование, скачивание и локальный просмотр конфигурации
- Адаптивный доступный интерфейс без frontend-фреймворков
- Открытый исходный код под GPL-3.0 и отсутствие аналитики по умолчанию

## Как это работает

```text
Browser -> Vercel / Netlify -> free-warp-deploy -> X25519 -> Cloudflare WARP API
       -> WireGuard configuration -> Amnezia -> WARP network
```

Vercel и Netlify только генерируют конфигурацию. Полученный сетевой профиль предназначен для защищённого подключения через инфраструктуру WARP.

## Быстрый старт

Нажмите одну из кнопок деплоя выше, откройте созданный сайт и выберите **Generate configuration**. Импортируйте скачанный файл `warp.conf` в совместимый сценарий использования профиля WireGuard в Amnezia.

## Конфигурация

`WARP_PREFERRED_LOCATION` принимает значения `auto`, `de`, `nl`, `pl`, `fi`, `gb`, `fr`, `us`, `ca`, `jp`, `sg` и `au`. Значение по умолчанию — `auto`. Это обычная переменная конфигурации деплоя, а не секрет. При необходимости `WARP_API_BASE_URL` позволяет заменить адрес внешнего API.

Выбор локации работает по принципу best-effort. Фактический endpoint определяется внешним API и сетевой маршрутизацией; конкретная географическая локация не гарантируется.

## API

`GET /api/warp` генерирует сетевой профиль. `GET /api/warp?key=<base64>` использует переданный приватный ключ длиной 32 байта. `POST /api/warp` принимает `{ "key": "...", "location": "auto" }`. Для получения готовой конфигурации в текстовом виде используйте `?format=config` или заголовок `Accept: text/plain`. Ответы помечаются заголовком `Cache-Control: no-store`.

Ошибки используют стабильные коды, например `INVALID_PRIVATE_KEY`, `WARP_REGISTRATION_FAILED` и `WARP_CONFIGURATION_FAILED`. Endpoint ограничивает размер входных данных, устанавливает timeout внешних запросов и применяет лёгкую stateless-защиту. Надёжное распределённое ограничение частоты запросов потребовало бы общего хранилища состояния и намеренно не включено в проект.

## Использование с Amnezia

1. Откройте Amnezia.
2. Выберите импорт конфигурации WireGuard.
3. Укажите файл `warp.conf`.
4. Проверьте параметры профиля и подключитесь.

Поддержка отдельных версий клиента и всех параметров зависит от конкретного клиента.

## Безопасность

Приватные ключи, токены регистрации и сгенерированные профили намеренно не сохраняются и не записываются в логи. Подробнее см. в [SECURITY.md](SECURITY.md). Проект не добавляет аналитику и стороннее отслеживание.

## Конфиденциальность

Сгенерированные приватные ключи являются временными. Проект намеренно не хранит созданные конфигурации и не требует базы данных. Регистрация WARP выполняется через API Cloudflare, поэтому к этому сервису применяются собственные условия и политика конфиденциальности Cloudflare. Проект не обещает абсолютную анонимность.

## Ограничения

Проект не предоставляет сервер ретрансляции трафика. Vercel и Netlify выполняют только API генерации конфигурации. Сгенерированная конфигурация WireGuard подключается к инфраструктуре Cloudflare WARP. Доступность, маршрутизация, производительность и выбор географического endpoint зависят от Cloudflare. Проект не гарантирует доступ к какому-либо конкретному ресурсу, сервису или сетевому назначению.

## Разработка и тестирование

Требуется Node.js 20 или новее. Выполните `npm ci`, затем используйте `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint` и `npm run build`. Команда `npm run check:all` запускает полный локальный аудит, включая проверки архитектуры, публичных текстов, зависимостей и секретов. Тесты не обращаются к реальному внешнему API.

## CI/CD

CI запускается при каждом push и pull request и проверяет установку зависимостей, типы, линтинг, форматирование, unit-тесты и сборку. Architecture workflow дополнительно проверяет границы слоёв, публичные формулировки, зависимости и случайно добавленные секреты. Теги формата `v*.*.*` создают GitHub Release только после успешного полного аудита. Рекомендуемые правила защиты ветки требуют прохождения CI и Architecture audit, pull request, одного review и запрещают прямые push в `main`.

## Структура проекта

`src/domain` содержит типы и форматирование профиля; `src/application` координирует сценарии использования; `src/infrastructure` реализует криптографию и WARP-клиент; `src/presentation` отвечает за HTTP; `api` и `netlify/functions` являются тонкими адаптерами.

## Участие в разработке

Правила участия описаны в [CONTRIBUTING.md](CONTRIBUTING.md). Пользовательские тексты должны использовать нейтральную технически точную терминологию и не должны гарантировать конкретный endpoint или уровень конфиденциальности.

## License

Проект распространяется по GNU General Public License v3.0. Текст лицензии находится в [LICENSE](LICENSE).

## Citation

```bibtex
    @software{ehristoforu_free-warp-deploy_2026,
        author = {ehristoforu},
        month = aug,
        title = {{free-warp-deploy}},
        url = {https://github.com/ehristoforu/free-warp-deploy},
        year = {2026}
    }
```

## Star History

<a href="https://www.star-history.com/?repos=ehristoforu%2Ffree-warp-deploy&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ehristoforu/free-warp-deploy&type=date&theme=dark&legend=top-left&sealed_token=EawSCOQV9hVNGTGr-3-2CGEA7idxkYxlOQuXyFx7kiNwfveVwId5orSpLdWL9eczdbBO1gl48MWeNudEx8KQ1NfPL0S0fWntsWH5ZtIBpqfaoh5RaayswQ" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ehristoforu/free-warp-deploy&type=date&legend=top-left&sealed_token=EawSCOQV9hVNGTGr-3-2CGEA7idxkYxlOQuXyFx7kiNwfveVwId5orSpLdWL9eczdbBO1gl48MWeNudEx8KQ1NfPL0S0fWntsWH5ZtIBpqfaoh5RaayswQ" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ehristoforu/free-warp-deploy&type=date&legend=top-left&sealed_token=EawSCOQV9hVNGTGr-3-2CGEA7idxkYxlOQuXyFx7kiNwfveVwId5orSpLdWL9eczdbBO1gl48MWeNudEx8KQ1NfPL0S0fWntsWH5ZtIBpqfaoh5RaayswQ" />
 </picture>
</a>
