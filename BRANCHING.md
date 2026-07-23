# Branching Strategy

## Branches

### main
- Production-ready code
- Protected branch
- No direct commits

### develop
- Integration branch
- All feature branches are merged here through Pull Requests

### feature/*
- Used for individual feature development
- Created from `develop`

## Workflow

```
feature/* → Pull Request → develop → Pull Request → main
```

## Rules

- No direct push to `main`
- No direct push to `develop`
- One Pull Request approval is required
- Code Owner approval is required before merge
