# Contributing to pipeline-forge

First off — thank you for considering a contribution. `pipeline-forge` exists to be a practical, reusable CI/CD reference, and every improvement makes it better for everyone who forks it.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How to contribute](#how-to-contribute)
- [Development setup](#development-setup)
- [Branching strategy](#branching-strategy)
- [Commit message format](#commit-message-format)
- [Pull request process](#pull-request-process)
- [Running tests](#running-tests)
- [Reporting bugs](#reporting-bugs)
- [Suggesting features](#suggesting-features)

---

## Code of conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to abide by its terms. Please be respectful and constructive.

---

## How to contribute

There are several meaningful ways to contribute:

- **Fix a bug** — open an issue first describing what you found, then submit a PR
- **Improve a pipeline stage** — suggest or implement a better pattern for any of the 7 stages
- **Add a new pipeline scenario** — open a feature request issue before writing code
- **Improve documentation** — docs improvements are always welcome with no issue required
- **Report a broken config** — if a tool version has changed and something breaks, please open a bug report

---

## Development setup

### Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 24.x LTS |
| npm | 10.x |
| Docker | 24.x |
| Docker Compose | v2.x (the `docker compose` CLI plugin, not `docker-compose` v1) |
| Git | 2.40+ |

### First-time setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/qa-ashutosh/pipeline-forge.git
cd pipeline-forge

# 2. Install root and workspace dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start the full local stack
docker compose up --build

# 5. Verify everything is running
curl http://localhost:3001/api/v1/health   # users-api
curl http://localhost:3002/api/v1/health   # orders-api
# Pact Broker UI: http://localhost:9292 (user: pact_user / pact_password)
```

Husky hooks are installed automatically by `npm install` via the `prepare` script.

---

## Branching strategy

```
main                                            ← production-ready, protected, requires PR + CI gate
  └─ develop                                    ← integration branch, auto-deploys to staging
      └─ feature/stage-XX-<short-description>   ← your work branch
```

Always branch from `develop`, not `main`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-improvement
```

---

## Commit message format

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/). This is enforced by a `commit-msg` Git hook — invalid messages are rejected locally.

```
<type>(<optional-scope>): <short description>

[optional body]

[optional footer — e.g. Closes #42]
```

### Valid types

| Type | When to use | Triggers release? |
|---|---|---|
| `feat` | New feature or pipeline pattern | Minor |
| `fix` | Bug fix | Patch |
| `docs` | Documentation only | No |
| `ci` | CI/CD config changes | No |
| `test` | Test additions or updates | No |
| `refactor` | Code refactor, no behaviour change | Patch |
| `chore` | Dependency updates, maintenance | No |
| `perf` | Performance improvement | Patch |
| `revert` | Reverting a previous commit | Patch |

### Examples

```bash
feat(users-api): add pagination to GET /users
fix(ci): correct artifact retention days in upload step
docs: update TEST_STRATEGY with k6 thresholds
ci(docker): pin pact-broker image to digest tag
```

---

## Pull request process

1. Ensure your branch is up to date with `develop`
2. Run tests locally: `npm test` in each affected service
3. Ensure CI is green — do not request review on a red build
4. Fill in the PR template completely
5. Request review from `@qa-ashutosh` (auto-assigned via CODEOWNERS)
6. Address review feedback — use `git commit --fixup` if needed
7. A maintainer will squash-merge once approved and CI passes

---

## Running tests

```bash
# All workspaces from repo root
npm test

# Single service
cd services/users-api && npm test
cd services/orders-api && npm test

# With coverage
npm run test:coverage

# Type check only (no emit)
npm run build:check --workspaces
```

---

## Reporting bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml) issue template. Please include reproduction steps and relevant logs.

## Suggesting features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml) template. Describe the problem you're solving and why it belongs in this repo.

---

## Recognition

Contributors are listed in GitHub's contributors graph and referenced in release notes where applicable. Thank you for making `pipeline-forge` better.
