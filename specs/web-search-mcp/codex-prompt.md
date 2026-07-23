# Codex implementation prompt: Web Search MCP

Status: Approved

Revised: 2026-07-24 — The previous approval was invalidated by the upstream pnpm bootstrap change. This draft now follows the reapproved design and task plan for offline package-manager bootstrap and approved dependency-source verification.

## Assignment

Implement the approved specification in `specs/web-search-mcp/` without expanding, redesigning, or weakening it.

This is a greenfield, route-only TypeScript/Next.js MCP service. Implement the application files in the current workspace while preserving the approved specification directory and any unrelated user changes. Do not begin an external deployment until the applicable approved task’s explicit authorization gate has been satisfied.

## Source of truth

Read these files completely before modifying application code:

1. `specs/web-search-mcp/requirements.md`
2. `specs/web-search-mcp/design.md`
3. `specs/web-search-mcp/tasks.md`

Verify that all three say `Status: Approved`. If any file is missing, unreadable, internally inconsistent, or not approved, stop and ask one precise question.

The approved documents have this precedence:

1. `requirements.md` defines required outcomes, measurable constraints, edge behavior, acceptance criteria, and exclusions.
2. `design.md` defines the authorized technical solution, package/runtime choices, interfaces, security model, flows, tests, and rollout.
3. `tasks.md` defines the only authorized implementation sequence and per-task completion checks.

Do not modify approved requirements or design content. During implementation, the only permitted specification edits are task `Status` values and `Implementation notes` in `tasks.md`. A substantive change requires reopening the SDD workflow and reapproving every affected document in order.

## Preflight

Before changing application code:

1. Read applicable `AGENTS.md` files and repository documentation, if present.
2. Inspect the workspace layout and repository status without changing or discarding existing work.
3. Confirm whether a Git repository now exists; preserve all unrelated tracked and untracked user files.
4. Compare the current workspace to the greenfield evidence in the approved documents. If application files already exist, inspect them and stop if they conflict with the approved architecture or task paths.
5. Verify Node.js 24.x and that the already installed `pnpm --version` reports 10.28.1. Do not invoke Corepack, activate or download another pnpm release, or silently substitute another runtime or package manager.
6. Before creating any project file or resolving/installing a package, perform TASK-001’s approved dependency-source preflight. Accept only the existing configured public registry, an operator-approved internal mirror, or a complete pre-populated pnpm store capable of satisfying the exact graph offline. Do not alter/bypass the configured proxy or embed a registry credential. If no approved source is usable, mark TASK-001 Blocked, record sanitized evidence, and ask which approved source will be provided.
7. Through the selected approved source, verify that the exact approved package versions can be resolved. Do not use prerelease tags, floating versions, MCP SDK v2 beta, TypeScript 7, or a new protocol revision.
8. Do not read, print, echo, copy, or solicit secret values during local tasks. Default tests must use injected fake values and mocked TinyFish responses.
9. Run any existing baseline lint, typecheck, test, and build commands before editing when they are already configured; record failures as pre-existing evidence.
10. Inspect `tasks.md` and find the first non-Completed task whose dependencies are all Completed. Work only on that task.
11. Before TASK-009 or TASK-010, verify explicit user authorization for that exact external action and perform the harmless read-only Vercel access check required by the task. If authorization/access is absent, mark the task Blocked and ask one precise question.

## Execution

Execute `TASK-001`, `TASK-002`, `TASK-003`, `TASK-004`, `TASK-005`, `TASK-006`, `TASK-007`, `TASK-008`, `TASK-009`, and `TASK-010` in dependency order.

For each task:

1. Confirm every listed dependency is `Status: Completed`.
2. Change only the active task’s status from `Pending` to `In Progress`.
3. Implement only the active task’s approved paths, steps, and outcomes.
4. Preserve repository conventions and unrelated user changes discovered during preflight.
5. Add or update the tests required by that task; do not postpone task-local verification to a later catch-all change.
6. Run every verification command listed for the task.
7. Compare results with the task’s objective completion criteria and the upstream acceptance criteria.
8. Record concise implementation notes in `tasks.md`, including changed areas, exact verification commands, pass/fail outcomes, and sanitized evidence.
9. Change the task to `Completed` only when every verification and completion criterion succeeds.
10. If any criterion fails or cannot be run, set the task to `Blocked`, record the sanitized evidence, and ask one focused question.

Implementation rules:

- Set `packageManager` to `pnpm@10.28.1`, use the already installed executable without a bootstrap download, pin exact dependency versions, and commit `pnpm-lock.yaml`.
- Resolve and install packages only through the approved configured registry/mirror or complete pre-populated pnpm store. Never modify proxy settings, introduce an unapproved registry, or continue package-dependent work after dependency-source verification fails.
- Use `@modelcontextprotocol/sdk@1.29.0` directly. Do not install or use `mcp-handler`.
- Build `app/mcp/route.ts` with a request-local `McpServer` and `WebStandardStreamableHTTPServerTransport`.
- Configure the transport with `sessionIdGenerator: undefined` and `enableJsonResponse: true`.
- Guarantee transport/server cleanup in `finally` for success, error, timeout, protocol failure, and cancellation.
- Keep Origin/authentication checks before MCP body parsing.
- Keep search validation strict and provider `domain_type` internal.
- Keep one 10-second overall TinyFish deadline across attempts and the 250 ms eligible retry delay.
- Never retry a `4xx` response and never make more than two TinyFish attempts.
- Preserve result ranking and only the approved fields.
- Return equivalent `structuredContent` and deterministic JSON text.
- Emit exactly one allowlisted application telemetry event per HTTP request.
- Do not register SDK logging, resources, prompts, sampling, elicitation, tasks, sessions, or server notifications.
- Keep default CI and local verification fully mocked and independent of production secrets or live TinyFish access.
- Run the complete approved release gate after changes that can affect integration:
  - `pnpm --version` must report 10.28.1 without an activation/download step
  - `pnpm install --frozen-lockfile`, or `pnpm install --offline --frozen-lockfile` when the approved source is the pre-populated store
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test --coverage`
  - `pnpm build`
- Confirm the frozen install leaves `pnpm-lock.yaml` unchanged.
- Meet 100% branch coverage for authentication, validation, retry/deadline, and error mapping, plus at least 90% statements overall.

Deployment rules:

- TASK-009 authorizes only a Vercel Preview after the user explicitly approves that action and read-only Vercel access succeeds.
- TASK-010 authorizes Production promotion only after the verified Preview outcome is presented and the user explicitly approves Production promotion.
- Configure secrets through Vercel settings/tools without retrieving or exposing their values.
- Promote the exact verified Preview source/artifact; do not rebuild different code for Production.
- Do not rotate either credential unless the user explicitly authorizes rotation after suspected exposure.
- Record only sanitized deployment identifiers, URLs, commands, timings, and outcomes in implementation notes.

## Stop conditions

Mark the active task `Blocked`, add concise sanitized evidence to its implementation notes, and ask one focused question before proceeding when:

- required information is missing or ambiguous;
- an approved document conflicts with another approved document or verified platform behavior;
- implementation requires changing a requirement, acceptance criterion, design decision, task intent, tool name, field, error category, timeout, capacity target, dependency version, or transport behavior;
- the already installed pnpm is not version 10.28.1, using it would require a download/activation step, or the environment cannot use it without altering the configured proxy;
- the configured registry/mirror cannot resolve the exact dependency graph and no complete approved offline store is available;
- an exact approved package is unavailable or contains a newly discovered incompatibility;
- the official SDK cannot provide stateless JSON Streamable HTTP with the approved options;
- existing workspace changes overlap an approved target and cannot be preserved safely;
- a test, coverage threshold, lint, typecheck, build, or task-specific verification fails;
- completing work would require a database, cache, queue, analytics service, new provider, new credential, paid-only Vercel service, or other excluded dependency;
- a secret would need to be displayed, extracted, logged, committed, or repurposed;
- Vercel access is unavailable, requests authentication, or lacks the Hobby project needed for TASK-009;
- Preview deployment lacks explicit authorization;
- Production promotion lacks a separate explicit authorization after Preview verification;
- credential rotation, rollback execution, or another externally consequential action lacks explicit authorization;
- the work would exceed scope or violate a NOT-TO-DO.

Do not invent a workaround, silently choose a different dependency, loosen a test, reduce coverage, broaden logging, add an endpoint, or redesign the approved solution.

## NOT-TO-DOs

- Do not add research-paper search, expose `domain_type`, or advertise any tool other than `web_search` and `news_search`.
- Do not add another provider, provider interface, provider registry, or pluggable provider abstraction.
- Do not fetch, crawl, scrape, open, summarize, rerank, deduplicate, enrich, or transform result pages.
- Do not add a database, persistence layer, cache, query history, analytics pipeline, internal queue, or shared mutable session state.
- Do not add OAuth, accounts, scopes, tenant isolation, per-user quotas, signup, admin UI, browser UI, health endpoint, or public metadata endpoint.
- Do not add local stdio, legacy HTTP plus SSE, POST SSE responses, standalone SSE, `/sse`, `/message`, or client-specific transport endpoints.
- Do not install or use `mcp-handler`, Redis, the TinyFish SDK, MCP SDK v2 beta, a prerelease package, or an unreleased MCP protocol revision.
- Do not invoke Corepack, download or activate another pnpm release, use npm/yarn instead, alter/bypass the configured proxy, introduce an unapproved registry, embed registry credentials, omit the lockfile, or continue package-dependent work when the approved dependency source is unavailable.
- Do not add wrapper-specific domain arrays, `max_results`, or any input not approved in the schema.
- Do not retry `4xx` responses, follow `Retry-After` automatically, exceed one eligible retry, or create work after the 10-second deadline.
- Do not expose, echo, persist, cache, or log bearer tokens, API keys, authorization headers, environment values, queries, results, request URLs containing search data, raw provider bodies, exception messages, or stack traces.
- Do not enable permissive CORS, accept a mismatched present Origin, weaken timing-safe comparison, or parse MCP bodies before authorization.
- Do not enable SDK verbose logging or any capability not needed by the two tools.
- Do not weaken exact dependency pins, type safety, test scope, coverage thresholds, or release commands to make verification pass.
- Do not deploy Preview or Production, rotate credentials, or execute rollback without the explicit authorization specified in the task plan.
- Do not change approved specification content outside task statuses and implementation notes.

## Completion report

When work stops or completes, report:

1. The status of every task from TASK-001 through TASK-010.
2. The application files and components created or changed, grouped by task.
3. Sanitized bootstrap evidence: Node.js and pnpm versions, whether the approved source was a configured registry/mirror or complete offline store, frozen-install outcome, and confirmation that no package-manager download, proxy bypass, or lockfile mutation occurred.
4. Every verification command run and its result.
5. Final lint, typecheck, coverage percentages, test, and production-build outcomes.
6. MCP contract evidence: initialization, exactly two tools, JSON-only stateless transport, no session/SSE behavior, success/error equivalence, and cancellation.
7. TinyFish adapter evidence: fixed domain types, filters, 10-second shared deadline, retry count, `4xx` behavior, body cap, and normalization.
8. Security/privacy evidence: Origin/auth statuses, timing-safe comparison, no-store/request ID headers, log allowlist, and forbidden-data negative tests.
9. Concurrency/capacity evidence for five simultaneous calls and 30 calls per minute without an internal queue.
10. Preview and Production deployment status, including whether each authorization gate was reached, approved, completed, blocked, or intentionally left pending.
11. Sanitized smoke-test and rollback-readiness results for any authorized deployment.
12. Any blocker, deviation, pre-existing failure, or reopened specification decision.

Never include credential values, authorization headers, query text, result content, raw provider responses, exception messages, or stack traces in the completion report.
