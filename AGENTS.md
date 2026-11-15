# Anchor Card

A Home Assistant dashboard card (`custom:ha-card-anchor`) that gives a dashboard stable in-page anchor targets. It's a Lit web component in `src/card/ha-card-anchor.js`, built with rolldown into `dist/ha-card-anchor.js` and distributed through HACS.

## Stack

- pnpm, pinned by `packageManager` in `package.json`, with `pnpm-lock.yaml`
- Lit, `home-assistant-js-websocket` and superstruct at runtime
- rolldown with Babel for the build, and TypeScript for types
- oxlint with `@timmo001/oxlint-rules` (`oxlint.config.ts`) and Prettier

## Checks

- `pnpm lint` runs oxlint.
- `pnpm format` formats with Prettier. Run it before committing.
- `pnpm build` writes `dist/`. Don't edit `dist/` by hand.
- `pnpm publish-to-local` pushes a build to a running Home Assistant over SSH. Only run it when asked.

## Rollout

- Pull requests and pushes to `main` run the Lint, Build and HACS Validate workflows from `timmo001/workflows`.
- Publishing a GitHub release runs the shared release workflow, which attaches the built card with provenance.
- Work on the current branch. Commit and push only when asked.
