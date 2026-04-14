# Test Strategy — pipeline-forge

> **Author:** Maintained by the pipeline-forge core team  
> **Version:** aligned with repo versioning via CHANGELOG.md  
> **Scope:** Both microservices (`users-api`, `orders-api`) and all pipeline stages

---

## 1. Philosophy

Testing in pipeline-forge follows three core principles:

**Shift left** — catch defects as early as possible, as close to the developer as possible. A bug found in a pre-commit hook costs seconds. The same bug found in production costs hours.

**Test pyramid, not ice cream cone** — the majority of tests are fast, isolated unit tests. Integration and contract tests cover boundaries. Heavy end-to-end tests are reserved for the critical path only.

**Pipeline as quality gate** — every stage of the CI/CD pipeline enforces a quality gate. No merge to `main` is possible without all gates passing.

---

## 2. Test Pyramid

```
              ┌─────────────────┐
              │   E2E / smoke   │            ← Stage 05 (post-deploy health checks)
              └───────┬─────────┘
           ┌──────────┴────────────┐
           │    Contract (Pact)    │         ← Stage 02 (consumer-driven)
           └──────────┬────────────┘
        ┌─────────────┴───────────────┐
        │     Integration tests       │      ← Stage 02 (route-level, supertest)
        └─────────────┬───────────────┘
     ┌────────────────┴──────────────────┐
     │            Unit tests             │   ← Stage 01+ (repository, service logic)
     └───────────────────────────────────┘
```

| Layer | Tool | Runs in | Gate |
|---|---|---|---|
| Unit | Jest + ts-jest | Pre-commit, CI | 80% coverage minimum |
| Integration | Jest + Supertest | CI | All routes tested |
| Contract | Pact + OSS Broker | CI | Provider must verify before deploy |
| Load | k6 | CI (Stage 06) | p95 < 500ms, error rate < 1% |
| Smoke | curl / k6 | Post-deploy | Health endpoint 200 |

---

## 3. Unit Testing

**Scope:** Pure logic — repositories, utility functions, transformation logic.  
**Tool:** Jest 29 + ts-jest  
**Location:** `src/__tests__/*.test.ts` co-located with source  
**Coverage threshold:** 80% branches, functions, lines, statements (enforced by Jest config)

### What is unit tested

- `UserRepository` — CRUD operations, edge cases, reset behaviour
- `OrderRepository` — CRUD operations, total calculation, filtering
- Any utility/helper functions added in future stages

### What is NOT unit tested

- Express route wiring (covered by integration tests)
- External HTTP calls (mocked at the client boundary)
- Docker/CI configuration (tested by running them)

### Running locally

```bash
# From service root
npm test

# With coverage report
npm run test:coverage
```

---

## 4. Integration Testing

**Scope:** HTTP route behaviour — correct status codes, response shapes, error handling.  
**Tool:** Jest + Supertest  
**Key principle:** The Express app is instantiated directly via `createApp()` — no network port required, no Docker needed.

### What is integration tested

- Every defined route: status codes, response body shape
- Error paths: 400 validation errors, 404 not-found responses
- External service calls are **mocked at the client level** (e.g. `UsersClient` is mocked in orders-api tests)

### What integration tests do NOT cover

- The actual inter-service HTTP call (that is Pact's job)
- Database persistence (in-memory repo resets per test suite)

---

## 5. Contract Testing (Stage 02)

**Tool:** Pact (consumer-driven contract testing)  
**Broker:** Self-hosted OSS Pact Broker (Docker, port 9292)  
**Pattern:** Consumer-driven — the `orders-api` (consumer) defines what it expects from `users-api` (provider). The provider must verify it satisfies that contract on every CI run.

### Flow

```
orders-api (consumer)          Pact Broker              users-api (provider)
       │                            │                           │
  Writes pact test ──────────────►  │                           │
  Generates pact file               │                           │
  Publishes pact ────────────────►  │                           │
                                    │  ◄── Fetches pact ────────│
                                    │                    Runs verification
                                    │  ◄── Publishes result ────│
  Can-I-Deploy? ─────────────────►  │                           │
  ◄── Yes / No ───────────────────  │                           │
```

### Contract definition (Stage 02 preview)

The contract covers the `GET /api/v1/users/:id` interaction:

- **Request:** `GET /api/v1/users/usr_001`  
- **Response:** `200`, body contains `{ data: { id, name, email } }`  
- **On 404:** Response contains `{ error: 'NOT_FOUND' }`

### Optional: PactFlow

See `docs/PACTFLOW_SETUP.md` for swapping the self-hosted broker for PactFlow SaaS in 3 environment variable changes.

---

## 6. Load Testing (Stage 06)

**Tool:** k6  
**Location:** `tests/load/`  
**Thresholds (SLOs):**

| Metric | Threshold |
|---|---|
| http_req_duration p(95) | < 500ms |
| http_req_failed | < 1% |
| http_reqs | > 50/s sustained |

Load tests run in CI against a `staging` environment after successful deployment (Stage 05+). They do not run on every PR — only on merges to `develop` or `main`.

---

## 7. Smoke Testing (Stage 05+)

After every deployment a lightweight smoke test validates the deployed service is alive:

```bash
# Health endpoint returns 200
curl --fail http://<service-url>/api/v1/health

# Basic GET returns data
curl --fail http://<service-url>/api/v1/users
```

A failing smoke test triggers an automatic rollback (Stage 05, ArgoCD).

---

## 8. Quality Gates Summary

| Gate | Enforced by | Blocks |
|---|---|---|
| Commit message format | commitlint + Husky | Local commit |
| Code formatting | Prettier + lint-staged | Local commit |
| Lint errors | ESLint (0 warnings) | CI |
| TypeScript compile | `tsc --noEmit` | CI |
| Unit test pass | Jest | CI |
| Coverage threshold (80%) | Jest | CI |
| Contract verified | Pact | CI |
| Security scan pass | Trivy + OWASP (Stage 03) | CI |
| Can-I-Deploy | Pact Broker | CI deploy step |
| Smoke test | curl / k6 | Post-deploy |
