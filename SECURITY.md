# Security

Report security issues privately to the repository maintainers rather than opening a public issue. Do not include private keys, registration tokens, or generated profiles in reports.

The service is stateless by design. It does not intentionally persist private keys, registration tokens, generated configurations, cookies, or analytics data. API responses use `Cache-Control: no-store`; external calls have timeouts and sensitive values are not logged.

Deployments should keep dependencies current, use HTTPS, and configure platform access controls according to the provider's documentation. The upstream WARP API remains an external dependency and its terms and privacy policy apply.
