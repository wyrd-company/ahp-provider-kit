# AHP Provider Kit

Provider-facing TypeScript contracts and helper utilities for Wyrd AHP adapter packages.

Package target: `@wyrd-company/ahp-provider-kit`.

This package exists so `@wyrd-company/ahp-server` and provider adapters can share the same provider/session contract without depending on each other. Provider packages should import these types and helpers directly, while `@wyrd-company/ahp-server` re-exports them for compatibility.

## Contents

- `AgentProvider`, `AgentSession`, and session context contracts.
- Active-client tool routing contracts and `ActiveClientToolRouter`.
- Markdown turn emission helpers.
- Single-model agent metadata and model-selection helpers.
- File URI to local path conversion.

## Development

```bash
npm install
npm run verify
```
