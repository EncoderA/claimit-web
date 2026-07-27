# Security Reporting

Security reports are produced by `.github/workflows/security.yml` for every `main`/`develop` push or PR and every Monday at 06:00 UTC.

## Report Delivery

- Primary delivery: GitHub Actions artifact retained for 90 days.
- Optional delivery: set `SLACK_WEBHOOK_URL` to post the run summary to the security channel.
- Owner: Security team reviews weekly scheduled baselines and any failed PR security gate.

## Baseline Layout

```text
security-baseline/
  dependency-audit.json
  semgrep.sarif
  summary.md
```

## Policy

- `npm audit --audit-level=high` fails on high and critical advisories.
- Semgrep JavaScript and TypeScript rules must pass.
- Branch protection should require CI and Security Gate checks on `main` and `develop`.
