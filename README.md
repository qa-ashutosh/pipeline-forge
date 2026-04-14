# pipeline-forge 🔧

> Enterprise-grade CI/CD pipeline patterns — fork-ready, multi-tool, production-proven.

[![CI](https://github.com/qa-ashutosh/pipeline-forge/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/qa-ashutosh/pipeline-forge/actions/workflows/ci.yml)
[![Release](https://github.com/qa-ashutosh/pipeline-forge/actions/workflows/release.yml/badge.svg)](https://github.com/qa-ashutosh/pipeline-forge/actions/workflows/release.yml)
[![Latest Release](https://img.shields.io/github/v/release/qa-ashutosh/pipeline-forge?label=release&color=brightgreen)](https://github.com/qa-ashutosh/pipeline-forge/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-24_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-fe5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is this?

`pipeline-forge` is a **fully working, multi-stage CI/CD reference implementation** built on two Node.js/TypeScript microservices (`users-api` and `orders-api`). It demonstrates real-world pipeline engineering across 7 progressive commit stages — from repo scaffolding to signed container releases.

**Two ways to use this repo:**

- **Portfolio showcase** — every stage is a PR from a feature branch, showing branching strategy, conventional commits, semantic versioning, and a healthy CI graph
- **Reusable starter** — fork it, replace the service code, and your CI/CD pipeline is already wired up with best practices

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                    pipeline-forge                      │
│                  (npm workspace)                       │
│                                                        │
│   ┌──────────────────┐    ┌────────────────────────┐   │
│   │   users-api      │    │    orders-api          │   │
│   │   :3001          │◄───│    :3002               │   │
│   │                  │    │                        │   │
│   │  GET  /users     │    │  GET  /orders          │   │
│   │  GET  /users/:id │    │  GET  /orders/:id      │   │
│   │  POST /users     │    │  GET  /orders/enriched │   │
│   │  GET  /health    │    │  POST /orders          │   │
│   │                  │    │  GET  /health          │   │
│   │  Provider (Pact) │    │  Consumer (Pact)       │   │
│   └──────────────────┘    └────────────────────────┘   │
│                                                        │
│   ┌─────────────────────────────────────────────────┐  │
│   │   Pact Broker  :9292  (self-hosted OSS)         │  │
│   │   PostgreSQL   :5432  (Pact Broker storage)     │  │
│   └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

`orders-api` calls `users-api` to enrich order responses with user data. This inter-service boundary is the target of **Pact consumer-driven contract tests** (Stage 02).

---

## Quick start

### Prerequisites

- Node.js 24 LTS (`nvm use` will pick the right version from `.nvmrc`)
- Docker + Docker Compose v2
- Git 2.40+

### Run locally

```bash
# 1. Clone
git clone https://github.com/qa-ashutosh/pipeline-forge.git
cd pipeline-forge

# 2. Install dependencies (all workspaces)
npm install

# 3. Start full stack (both services + Pact Broker + PostgreSQL)
docker compose up --build

# 4. Verify
curl http://localhost:3001/api/v1/health   # {"service":"users-api","status":"ok"}
curl http://localhost:3002/api/v1/health   # {"service":"orders-api","status":"ok"}
curl http://localhost:3001/api/v1/users    # list of users
curl http://localhost:3002/api/v1/orders/ord_001/enriched  # order + user data

# Pact Broker dashboard
open http://localhost:9292   # login: pact_user / pact_password
```

### Run tests

```bash
# All workspaces from root
npm test

# With coverage
cd services/users-api && npm run test:coverage
cd services/orders-api && npm run test:coverage
```

---

## Stage roadmap

Each stage is its own PR — merged following the `feature/stage-XX-*` → `develop` → `main` flow, with a semantic version tag cut automatically on each `main` merge. Feature branches are deleted after merge — the full progression is preserved through PRs, semantic version tags, and the auto-generated changelog.

> **Why this order?** The stages follow a typical enterprise CI/CD maturity curve: start with a solid foundation and local dev experience, layer in build reproducibility and contract testing, then progressively add security gates, multi-tool CI, GitOps deployment, observability, and finally release engineering with signing and provenance. Each stage builds on the previous one, mirroring how a real platform team would evolve a pipeline incrementally.

| Stage | Branch | Focus | Key tools | Status |
|---|---|---|---|---|
| 01 | `feature/stage-01-foundation` | Repo scaffold, CI foundation, TypeScript services | GitHub Actions, Node 24, Husky, semantic-release | ✅ **Current** |
| 02 | `feature/stage-02-build-test` | Multi-stage Docker build, Jest, Supertest, Pact contract tests | Docker, ts-jest, Pact OSS | 🔜 |
| 03 | `feature/stage-03-security` | SAST, container scanning, dependency audit | Trivy, OWASP, SonarQube | 🔜 |
| 04 | `feature/stage-04-jenkins` | Declarative Jenkinsfile, shared libraries, parallel stages | Jenkins, Groovy, Blue Ocean | 🔜 |
| 05 | `feature/stage-05-gitops` | Helm charts, ArgoCD, environment promotion, smoke tests | Helm, ArgoCD, kind | 🔜 |
| 06 | `feature/stage-06-observability` | Prometheus metrics, Grafana dashboards, DORA metrics, k6 | Prometheus, Grafana, k6 | 🔜 |
| 07 | `feature/stage-07-release` | Semantic versioning, SBOM, container signing, provenance | Syft, Cosign, semantic-release | 🔜 |

---

## Tech stack

### Services

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 24 LTS (Krypton) | Runtime |
| TypeScript | 5.x | Language |
| Express | 4.x | HTTP framework |
| Helmet | 8.x | Security headers |

### CI/CD

| Tool | Purpose |
|---|---|
| GitHub Actions | Primary CI — build, test, release |
| Jenkins | Secondary CI — enterprise Declarative pipeline (Stage 04) |
| semantic-release | Automated versioning + changelog |
| Conventional Commits | Commit message standard |
| Husky + commitlint | Local enforcement of commit standard |

### Testing

| Tool | Layer | Stage |
|---|---|---|
| Jest + ts-jest | Unit + integration | 01 |
| Supertest | HTTP route integration | 01 |
| Pact (consumer-driven) | Contract testing | 02 |
| k6 | Load testing + SLOs | 06 |

### Security

| Tool | Purpose | Stage |
|---|---|---|
| Trivy | Container CVE scanning | 03 |
| OWASP Dependency-Check | Dependency vulnerability audit | 03 |
| SonarQube | SAST + code quality gate | 03 |

### Observability

| Tool | Purpose | Stage |
|---|---|---|
| Prometheus | Metrics scraping | 06 |
| Grafana | Dashboards (DORA metrics) | 06 |
| Alertmanager | Alerting rules | 06 |

### Release engineering

| Tool | Purpose | Stage |
|---|---|---|
| Syft | SBOM generation | 07 |
| Cosign | Container image signing | 07 |
| GitHub Releases | Versioned release artefacts | 01 |

---

## Repository structure

```
pipeline-forge/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI: lint, build, test
│   │   └── release.yml         # Semantic release on main merge
│   ├── ISSUE_TEMPLATE/         # Bug report + feature request templates
│   ├── CODEOWNERS              # Auto-review assignment
│   └── pull_request_template.md
├── docs/
│   ├── TEST_STRATEGY.md        # QA architecture decision record
│   └── PACTFLOW_SETUP.md       # Optional PactFlow SaaS swap guide
├── services/
│   ├── users-api/              # Provider service (Pact)
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile          # Multi-stage: dev + production
│   │   └── package.json
│   └── orders-api/             # Consumer service (Pact)
│       ├── src/
│       │   ├── types/
│       │   ├── clients/        # UsersClient — Pact boundary
│       │   ├── repositories/
│       │   ├── routes/
│       │   ├── app.ts
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── .env.example                # All environment variables documented
├── .husky/                     # Git hooks (commit-msg, pre-commit)
├── .releaserc.json             # semantic-release config
├── commitlint.config.js        # Commit message rules
├── docker-compose.yml          # Full local dev stack
├── CHANGELOG.md                # Auto-generated by semantic-release
├── CONTRIBUTING.md             # Open source contribution guide
└── package.json                # Monorepo root (npm workspaces)
```

---

## Branching strategy

```
main                          ← protected · requires PR + 1 review + CI gate · triggers release
  └─ develop                  ← integration · auto-deploys to staging (Stage 05+)
      └─ feature/stage-XX-*   ← stage branches (PRs into develop)
      └─ release/v*           ← release candidates (auto-created by semantic-release)
```

### Branch protection rules (applied to `main`)

- Require pull request before merging
- Require status checks: `CI Gate` must pass
- Require conversation resolution before merging
- Do not allow bypassing the above settings

---

## Commit format

```
<type>(<scope>): <description>

feat(users-api): add role-based filtering to GET /users
fix(ci): correct upload-artifact path for orders-api build
docs: update TEST_STRATEGY with contract test flow diagram
ci(docker): switch pact-broker to digest-pinned image tag
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full type reference and examples.

---

## Environment variables

All variables are documented in [`.env.example`](.env.example). Copy it to `.env` for local development — never commit `.env`.

---

## Fork and use

This repo is designed to be forked with minimal changes needed:

1. Fork the repo
2. Replace `qa-ashutosh` in `README.md`, `CODEOWNERS`, and issue templates to your `YOUR_GITHUB_USERNAME`
3. Run `npm install && docker compose up`
4. Start from Stage 02 for your own pipeline patterns

Everything else — the CI workflows, semantic-release config, commit hooks, Dockerfiles, test setup — works without modification.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Bug reports and feature requests welcome via [GitHub Issues](https://github.com/qa-ashutosh/pipeline-forge/issues).

---

## License

[MIT](LICENSE) — free to use, fork, and adapt.
