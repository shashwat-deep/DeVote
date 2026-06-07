# Disaster Recovery & Rollback Plan

This plan covers reverting code, contract, and deployment, plus backups.

## Recovery anchors

| Anchor                 | What it is                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `main` baseline commit | Pristine pre-modernization snapshot (`chore: baseline import...`). The overhaul lives on `refactor/aptos-modernization`. |
| Git tags               | Each `semantic-release` run tags a version (`vX.Y.Z`).                                                                   |
| Container images       | Each release builds `devote-web:<tag>`; keep the previous tag.                                                           |
| Move module            | Published under a known account; note the deploy tx and address.                                                         |

## 1. Roll back the frontend

**Static host (Netlify/Cloudflare):** redeploy the previous build, or
"rollback to previous deploy" in the host UI.

**Docker / compose:**

```bash
# pin to a known-good image tag and restart
docker compose pull            # or build a previous git tag
docker compose up -d --force-recreate
# emergency: run a specific prior image
docker run -d -p 8080:80 devote-web:<previous-tag>
```

**Source:** to abandon the overhaul entirely and return to the original app:

```bash
git checkout main              # the pristine baseline
# or revert a single bad release commit:
git revert <bad-commit-sha>
```

## 2. Roll back / recover the smart contract

Move state is immutable once written; plan accordingly.

- **Bad logic, not yet relied upon:** publish a fixed module. If deployed with
  an `upgrade_policy` of `compatible`, you can upgrade in place; otherwise
  publish under a new account and point `VITE_MODULE_ADDRESS` at it.
- **Corrupt/abandoned ballot resource:** resources cannot be edited externally.
  Create a fresh ballot (new official account) and migrate off-chain references.
- Always record the **module address** and **publish transaction hash** so a
  known-good version can be re-pinned in the frontend env.

## 3. Configuration & secrets

- App config is non-secret build-time `VITE_*` (see `apps/web/.env.example`).
  Keep the production `.env` values in your secrets manager / host settings.
- CI secrets: `GITHUB_TOKEN` (provided), optional `ANTHROPIC_API_KEY`,
  optional `VITE_SENTRY_DSN`. Rotate via the platform; no secrets live in git.

## 4. Backups (face-recognition data)

The only user-supplied media is the biometric data directory
(`DEVOTE_FACE_DATA_DIR`). Back it up encrypted, with retention. Example cron:

```cron
# Nightly encrypted backup with 30-day retention
0 2 * * * tar czf - -C "$DEVOTE_FACE_DATA_DIR" . \
  | gpg -c --batch --passphrase-file /etc/devote/backup.key \
  > "/backups/face-data-$(date +\%F).tar.gz.gpg" \
  && find /backups -name 'face-data-*.gpg' -mtime +30 -delete
```

Restore:

```bash
gpg -d /backups/face-data-<date>.tar.gz.gpg | tar xzf - -C "$DEVOTE_FACE_DATA_DIR"
```

## 5. Incident checklist

1. Identify the layer: frontend, contract, or data.
2. Communicate (status note); freeze releases.
3. Roll back the smallest layer that restores service (see above).
4. Capture logs/telemetry (Sentry) for root-cause.
5. Fix forward on a branch; let CI + AI review gate the fix.
6. Post-mortem; add a regression test.
