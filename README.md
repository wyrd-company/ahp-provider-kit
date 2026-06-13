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
