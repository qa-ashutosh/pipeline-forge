## Summary

<!-- One sentence: what does this PR do and why? -->

## Type of change

<!-- Check all that apply -->

- [ ] `feat` — new feature (triggers minor release)
- [ ] `fix` — bug fix (triggers patch release)
- [ ] `ci` — CI/CD changes (no release triggered)
- [ ] `docs` — documentation only (no release triggered)
- [ ] `refactor` — code refactor (triggers patch release)
- [ ] `test` — test additions or updates (no release triggered)
- [ ] `chore` — maintenance (no release triggered)
- [ ] `BREAKING CHANGE` — breaking change (triggers major release)

## Related issue

<!-- Closes #ISSUE_NUMBER -->

## What changed

<!-- Bullet points covering the key changes -->

-
-

## How to test locally

```bash
# Example commands to validate this change
docker compose up --build
curl http://localhost:3001/api/v1/health
```

## Checklist

- [ ] My commit message follows the [Conventional Commits](https://www.conventionalcommits.org/) spec
- [ ] I have added or updated tests to cover my changes
- [ ] All existing tests pass (`npm test` in the affected service)
- [ ] I have updated relevant documentation in `docs/`
- [ ] I have checked the CI pipeline is green
- [ ] I have not introduced any secrets or hardcoded credentials

## Screenshots / logs (if applicable)

<!-- Add output, curl responses, or screenshots here -->
