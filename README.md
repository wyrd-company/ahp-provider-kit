# AHP Provider Kit

Provider-facing TypeScript contracts and helper utilities for Wyrd AHP adapter packages.

Package target: `@wyrd-company/ahp-provider-kit`.

This package exists so `@wyrd-company/ahp-server` and provider adapters can share the same provider/session contract without depending on each other. Provider packages should import these types and helpers directly, while `@wyrd-company/ahp-server` re-exports them for compatibility.

## Contents

- `AgentProvider`, `AgentSession`, and session context contracts.
- `ResumableAgentProvider` and `ResumableAgentSessionContext` for adapters that can rebuild provider runtime state from persisted AHP session state.
- Active-client tool routing contracts and `ActiveClientToolRouter`.
- Markdown turn emission helpers.
- Single-model agent metadata and model-selection helpers.
- File URI to local path conversion.

## Session Resume

Providers that can resume persisted sessions should implement `ResumableAgentProvider`.
The server calls `resumeSession(context)` when it has a stored AHP session but no live
provider runtime handle, such as after process restart with a durable session store.

The resume context includes the trusted persisted `SessionState` and the same
server-owned active-client tool sink used for newly-created sessions. Adapters should
recover provider/runtime state from their own durable identifiers in the AHP state or
configuration; they should not rely on caller-supplied session correlation in tool
inputs.

## Development

```bash
npm install
npm run verify
```

## Releasing

[Intentional](https://github.com/wyrd-company/intentional) is the version and
release-intent authority for this repository. `.intentional/config.yml` defines
the single `ahp-provider-kit` release unit, `package.json` is a projection of that state,
and Git tags are the released-version record. Do not hand-edit the version in
`package.json`.

Continuous integration runs `intentional check` on every pull request and on
`main`. It validates only; it never releases.

### Record a change

Author an intent alongside the implementation it describes:

```bash
intentional add --release-unit ahp-provider-kit:minor --message "Add a user-visible capability."
```

Use `major`, `minor`, or `patch` for the compatibility impact of the change.
While the package is below `1.0.0`, the configured `compatibility` mapping
shifts each bump down one position: a `major` intent moves the minor number and
both `minor` and `patch` intents move the patch number. Commit the generated
file in `.intentional/intents/` with the code change.

### Cut a release

Releasing is a deliberate, human-authorized action. Nothing below happens
automatically.

```bash
intentional status
intentional check
intentional plan > release-plan.json
intentional apply --dry-run
intentional apply

git add -A
git commit -m "chore: release"
```

`apply` writes the new version into `package.json`, updates `CHANGELOG.md`, and
consumes the included intents.

`main` accepts changes only through a pull request, so open one for the release
commit and merge it. Then tag the merged commit on `main`:

```bash
git switch main && git pull
intentional tag --plan release-plan.json
```

`tag` creates the annotated release record using the plain `N.N.N` tag name that
the CD workflow expects. Pushing that tag starts publication and is the point of
no return:

```bash
git push origin <version>
```

`.github/workflows/cd.yml` reacts to the tag: it verifies the tag matches
`package.json`, builds, publishes to npmjs and GitHub Packages, and creates the
GitHub release. Delete `release-plan.json` once the release is tagged; it is
working material, not repository state.
