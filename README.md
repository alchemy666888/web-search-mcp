# Web Search MCP

Private route-only Next.js MCP server exposing exactly `web_search` and `news_search` at `/mcp`. It uses Node.js 24, preinstalled `pnpm@10.28.1`, exact pinned dependencies, bearer auth via `MCP_AUTH_TOKEN`, and TinyFish via server-side `TINYFISH_API_KEY`.

## Local verification

Do not use Corepack, change package managers, bypass proxies, or commit secrets. Use the configured registry/mirror or complete offline pnpm store:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test --coverage
pnpm build
```

## Tools

Both tools accept `query`, `purpose`, `location`, `language`, `include_domains`, `exclude_domains`, `recency_minutes`, `after_date`, `before_date`, and `page`. Unknown fields such as `domain_type` and `max_results` are rejected. Results include `query`, `results`, `total_results`, and `page`; each result includes the approved TinyFish metadata only.

## Security and privacy

Every request requires `Authorization: Bearer <token>`. Present `Origin` must match the request origin. Responses are `no-store` and tagged with `X-Request-ID`. Telemetry contains only request ID, tool name, outcome, elapsed milliseconds, and sanitized error code; it must not contain tokens, queries, results, provider bodies, or exception details.

## Deployment

Deploy Preview first only after explicit authorization and read-only Vercel access checks. Configure Preview and Production secrets in Vercel settings, never in repository files. Production promotion requires separate authorization after Preview verification. Rollback is a prior Vercel deployment restore because there is no database or migration.

## Smoke test

`node scripts/smoke.mjs --help` is safe. Live smoke requires explicit URL and token arguments and redacts sensitive output.
