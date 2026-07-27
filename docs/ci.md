# CI and Security Pipeline

## Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | Every push and PR | Gitleaks and Vitest coverage gate |
| `.github/workflows/security.yml` | `main`/`develop` push/PR and weekly Monday 06:00 UTC | npm audit, Semgrep, baseline report |

## Coverage Gate

- Tool: Vitest with V8 coverage.
- Threshold: 60% lines, branches, functions, and statements.
- Enforcement: `npm run test:coverage` in CI.
- Test ownership: product teams must add and maintain the React tests. This change intentionally adds the framework and gate without adding test cases.

## Security Baseline

Each security workflow uploads a `security-baseline-web-<run>-<sha>` artifact with this layout:

```text
security-baseline/
  dependency-audit.json
  semgrep.sarif
  coverage/
  summary.md
```

Set repository secret `SLACK_WEBHOOK_URL` to post scheduled baseline summaries to the security channel.
