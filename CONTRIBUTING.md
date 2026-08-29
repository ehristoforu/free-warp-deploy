# Contributing

1. Fork the repository and create a focused branch.
2. Run `npm ci` and make the smallest compatible change.
3. Run `npm run check:all` before opening a pull request.
4. Describe behavior, tests, and deployment impact in the pull request.

Use strict TypeScript, keep platform code in adapters, avoid new dependencies unless necessary, and never add secrets or real credentials. Pull requests must pass required CI and architecture checks. Commit messages should use an imperative style such as `feat: add profile metadata`.

Keep user-facing wording neutral and accurate. Do not make guarantees about geographic endpoints, availability, anonymity, or third-party client support.
