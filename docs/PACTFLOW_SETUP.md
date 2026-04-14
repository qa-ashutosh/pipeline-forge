# Optional: PactFlow SaaS Setup

By default `pipeline-forge` uses the **self-hosted OSS Pact Broker** running in Docker — this requires zero accounts or tokens and works completely offline.

If you prefer the hosted **PactFlow** dashboard (public URL, polished UI), you can swap to it with **3 environment variable changes**.

---

## Why self-hosted is the default

| Concern                         | Self-hosted       | PactFlow Free                  |
| ------------------------------- | ----------------- | ------------------------------ |
| Zero external accounts needed   | ✅                | ❌ needs signup                |
| Works on fork without config    | ✅                | ❌ needs new tokens            |
| Unlimited services              | ✅                | ❌ 2 integrations on free tier |
| Fully offline / air-gapped      | ✅                | ❌                             |
| Polished hosted dashboard URL   | ❌ localhost only | ✅                             |
| Bi-directional contract testing | ❌                | ✅                             |

---

## Switching to PactFlow (3 steps)

### Step 1 — Create a free PactFlow account

Sign up at [pactflow.io](https://pactflow.io/try-for-free) (no credit card required on the Starter plan).

Note your **workspace subdomain** — it will be something like `yourname.pactflow.io`.

### Step 2 — Generate a PactFlow API token

In your PactFlow dashboard: **Settings → API Tokens → Create token** → select **Read/Write**.

Copy the token value.

### Step 3 — Set these 3 environment variables

In your repo **Settings → Secrets and variables → Actions**, add:

| Secret name            | Value                          |
| ---------------------- | ------------------------------ |
| `PACT_BROKER_BASE_URL` | `https://yourname.pactflow.io` |
| `PACT_BROKER_TOKEN`    | your PactFlow API token        |
| `USE_PACTFLOW`         | `true`                         |

Then update your `docker-compose.yml` for local dev — comment out the `pact-broker` and `pact-broker-db` services and set:

```bash
export PACT_BROKER_BASE_URL=https://yourname.pactflow.io
export PACT_BROKER_TOKEN=your_token_here
```

That's it. The Pact publish and verify scripts in Stage 02 read these variables and route to PactFlow automatically.

---

## Reverting to self-hosted

Remove or unset the 3 variables above. The pipeline defaults back to `http://localhost:9292` with basic auth.
