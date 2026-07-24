# Tasks: Web Search MCP

Status: Approved

Revised: 2026-07-24 — TASK-001 now contains the complete exact runtime and development dependency list approved by the revalidated design, including exact `@types/*` pins.

## Execution rules

- Execute tasks in dependency order.
- Do not mark a task Completed until all verification succeeds.
- Record implementation notes without rewriting approved task intent.
- Preserve unrelated user changes and inspect the worktree before every task.
- Do not use production credentials in local tests or default CI.
- Do not perform a Vercel Preview or Production deployment without the explicit authorization required by the applicable task.
- Use the already installed `pnpm@10.28.1`; do not invoke Corepack, download another package-manager version, switch package managers, or alter/bypass the configured proxy.
- Before resolving or installing packages, require the configured public registry, an operator-approved internal mirror, or a complete pre-populated pnpm store capable of satisfying the exact dependency graph. If none is available, mark TASK-001 Blocked before creating project files.
- If implementation requires changing an approved requirement or design decision, mark the active task Blocked and reopen the SDD workflow.

## Task list

### TASK-001 — Bootstrap the pinned project and quality toolchain

Status: Completed

Requirements: REQ-NF-001, REQ-NF-008

Design: DES-010

Dependencies: None

Expected file or component changes:

- `package.json` — define the route-only application, Node.js 24 engine, pinned runtime/dev dependencies, `packageManager`, and quality scripts.
- `pnpm-lock.yaml` — lock the exact approved dependency graph.
- `tsconfig.json` — enable strict TypeScript checks suitable for Next.js and tests.
- `next-env.d.ts` — provide Next.js generated type references.
- `eslint.config.mjs` — configure ESLint 9 with the pinned Next.js rules.
- `vitest.config.ts` — configure Node test environment and baseline coverage collection.
- `.npmrc` — enforce exact dependency saves without embedding a registry URL, proxy override, or credential.

Steps:

1. Verify Node.js 24.x and the already installed pnpm 10.28.1 without invoking Corepack, activating another package-manager release, or modifying proxy/registry configuration.
2. Before creating project files, verify that either the existing configured registry/mirror can resolve the exact approved direct packages or a complete pre-populated pnpm store can perform offline resolution. If neither path is available, mark TASK-001 Blocked, record only sanitized failure evidence, and ask which approved dependency source will be provided.
3. Create the minimal Next.js/TypeScript project manifests without adding a UI, database, cache, analytics package, or unapproved runtime dependency.
4. Pin the approved versions: Next.js 16.2.11, React/React DOM 19.2.8, MCP SDK 1.29.0, Zod 4.4.3, pnpm 10.28.1, TypeScript 5.9.3, Vitest/coverage 4.1.10, ESLint 9.39.5, `eslint-config-next` 16.2.11, `@types/node` 24.13.3, `@types/react` 19.2.17, and `@types/react-dom` 19.2.3.
5. Use these exact package versions in `package.json`:

   Runtime dependencies:

   - `next`: `16.2.11`
   - `react`: `19.2.8`
   - `react-dom`: `19.2.8`
   - `@modelcontextprotocol/sdk`: `1.29.0`
   - `zod`: `4.4.3`

   Development dependencies:

   - `typescript`: `5.9.3`
   - `vitest`: `4.1.10`
   - `@vitest/coverage-v8`: `4.1.10`
   - `eslint`: `9.39.5`
   - `eslint-config-next`: `16.2.11`
   - `@types/node`: `24.13.3`
   - `@types/react`: `19.2.17`
   - `@types/react-dom`: `19.2.3`

   Package manager:

   - `packageManager`: `pnpm@10.28.1`
6. Define `lint`, `typecheck`, `test`, `test:coverage`, `build`, and later-compatible `smoke` scripts.
7. Resolve the exact dependency graph through the approved configured registry/mirror or with pnpm offline mode against the complete pre-populated store; generate and commit `pnpm-lock.yaml` using pnpm 10.28.1.
8. Prove that the committed graph supports a frozen install through the same approved source without changing any exact version or lockfile resolution.
9. Configure strict compilation, no JavaScript emission for typecheck, test discovery under `tests/`, and the approved coverage thresholds.

Verification:

- `node --version` reports Node.js 24.x.
- `pnpm --version` reports 10.28.1 without a package-manager download or activation step.
- Sanitized evidence confirms that an approved configured registry/mirror or complete offline store resolved the exact dependency graph without a proxy bypass or embedded credential.
- `pnpm install --frozen-lockfile` succeeds from the committed lockfile through the configured approved registry/mirror; when the selected source is a pre-populated store, `pnpm install --offline --frozen-lockfile` succeeds instead.
- `pnpm typecheck` succeeds against the scaffold.
- Inspection confirms every declared package version is exact and no prerelease tag or floating range is present.
- Inspection confirms `package.json`, `.npmrc`, and `pnpm-lock.yaml` contain no registry credential, proxy bypass, or unapproved package source.

Completion criteria:

- A clean frozen install is reproducible from `package.json` and `pnpm-lock.yaml` using pnpm 10.28.1 and the approved dependency source.
- The strict TypeScript, ESLint, Vitest, and Next.js commands are defined and runnable.
- Package-manager bootstrap required no network download, substitution, or proxy change.
- No application feature, UI, storage, queue, or excluded transport has been introduced.

Implementation notes:

- Completed bootstrap with exact pinned package.json, pnpm-lock.yaml, strict TypeScript, ESLint, Vitest coverage config, and .npmrc. Verified Node v24.15.0, pnpm 10.28.1, configured public registry resolution, frozen install, typecheck, and no lockfile mutation.

### TASK-002 — Implement search contracts, normalization, and stable errors

Status: Completed

Requirements: REQ-F-004, REQ-F-005, REQ-F-008, REQ-F-010, REQ-F-011, REQ-NF-008

Design: DES-005, DES-007, DES-008

Dependencies: TASK-001

Expected file or component changes:

- `src/search/types.ts` — define search input, normalized response/result, provider response, and tool-error types.
- `src/search/schemas.ts` — define strict Zod 4 input/output/provider schemas and cross-field refinements.
- `src/search/errors.ts` — define error classes/categories, safe provider-code handling, and deterministic tool-error construction.
- `src/search/normalize.ts` — validate/cap provider success bodies, normalize approved fields, and produce deterministic JSON text.
- `tests/unit/search-schemas.test.ts` — cover every input and cross-field rule.
- `tests/unit/search-errors.test.ts` — cover every stable error category and sanitization rule.
- `tests/unit/search-normalize.test.ts` — cover output validation, ordering, optional fields, body cap, and serialization.

Steps:

1. Implement the exact shared tool input schema with strict unknown-field rejection, outer trimming, calendar-aware dates, numeric bounds, mutual exclusion, and date ordering.
2. Define the normalized success schema with required top-level/core result fields, absolute HTTP(S) URLs, optional `date`/`publisher`, and valid empty results.
3. Define the eight approved error categories and fixed safe messages.
4. Allow an optional provider code only when it matches the approved uppercase/number/underscore pattern and limit.
5. Implement deterministic normalized object construction and JSON serialization, stripping every undocumented field.
6. Enforce the 1 MiB provider-body cap and map oversized/malformed/schema-invalid bodies to `UPSTREAM_INVALID_RESPONSE`.
7. Add exhaustive table-driven tests, including attempts to supply `domain_type`, domain arrays, `max_results`, invalid calendar dates, and secret-like error text.

Verification:

- `pnpm exec vitest run tests/unit/search-schemas.test.ts tests/unit/search-errors.test.ts tests/unit/search-normalize.test.ts` succeeds.
- `pnpm typecheck` succeeds.
- Inspection confirms error outputs contain no raw input value, provider body, exception message, or secret.

Completion criteria:

- Every approved input, output, and stable error contract is represented by one strict runtime schema and TypeScript type.
- All acceptance and rejection boundaries are covered by deterministic unit tests.
- Normalization preserves ranking and approved values while stripping everything else.

Implementation notes:

- Implemented strict search schemas, stable sanitized errors, provider body cap, normalization, and deterministic JSON. Verified with pnpm test --coverage and pnpm typecheck.

### TASK-003 — Implement runtime configuration and HTTP security primitives

Status: Completed

Requirements: REQ-F-002, REQ-F-012, REQ-F-015, REQ-NF-003, REQ-NF-004

Design: DES-002, DES-003

Dependencies: TASK-001, TASK-002

Expected file or component changes:

- `src/config.ts` — lazily read and validate server-side environment variables without import-time failure.
- `src/http/security.ts` — validate Origin, parse bearer authorization, compare SHA-256 digests with `timingSafeEqual`, and create generic HTTP errors.
- `tests/unit/config.test.ts` — cover complete and missing configurations without exposing variable identity.
- `tests/unit/http-security.test.ts` — cover Origin, bearer parsing, timing-safe comparison, status codes, and no-store headers.

Steps:

1. Implement lazy accessors for authentication and TinyFish configuration so module import never exposes a secret or crashes the function.
2. Implement the absent-Origin/same-origin/mismatched-origin policy against the canonical `Request.url`.
3. Parse exactly one non-empty bearer credential; reject missing, malformed, duplicated, or incorrect authorization.
4. Hash supplied and configured UTF-8 tokens with SHA-256 and compare equal-length digests with `crypto.timingSafeEqual`.
5. Return generic no-store `401`, `403`, and auth-configuration `503` responses with no credential/configuration details.
6. Ensure all security checks can run before any MCP body parsing or TinyFish call.
7. Test that secret values and variable names do not appear in returned bodies, headers, or captured application log arguments.

Verification:

- `pnpm exec vitest run tests/unit/config.test.ts tests/unit/http-security.test.ts` succeeds.
- `pnpm typecheck` succeeds.
- Branch coverage for configuration and authentication modules is 100%.

Completion criteria:

- The security primitives fail closed with the approved status and sanitization behavior.
- Bearer comparison is timing-safe and no test path parses MCP data before authorization.
- Missing TinyFish configuration is representable as the approved tool-level configuration error without identifying the variable.

Implementation notes:

- Implemented lazy configuration and HTTP security primitives including Origin policy, bearer parsing, SHA-256 timing-safe comparison, no-store generic responses, and tests. Verified with pnpm test --coverage and pnpm typecheck.

### TASK-004 — Implement the bounded TinyFish search client

Status: Completed

Requirements: REQ-F-006, REQ-F-007, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015, REQ-NF-005, REQ-NF-007

Design: DES-006, DES-007, DES-008

Dependencies: TASK-002, TASK-003

Expected file or component changes:

- `src/search/tinyfish-client.ts` — serialize requests, authenticate, enforce timeout/cancellation, retry eligible failures, parse errors, and normalize success.
- `tests/unit/tinyfish-client.test.ts` — cover parameter mapping, fixed domain type, headers, timeout, retry, cancellation, body cap, and every HTTP class.

Steps:

1. Accept only an internal `"web"` or `"news"` discriminant plus already-validated search input.
2. Build `GET https://api.search.tinyfish.ai` with `URLSearchParams`, each supplied filter exactly once, and a fixed provider `domain_type`.
3. Send only `X-API-Key` and `Accept: application/json`, set `cache: "no-store"`, and never expose the request URL or key to telemetry.
4. Combine the caller signal with one monotonic 10-second overall deadline.
5. Retry exactly once after 250 ms only for a transient network failure or HTTP `500/503`, and only when the same deadline still has time.
6. Abort provider work and retry delay on caller cancellation; never start work after deadline expiry.
7. Do not retry any `4xx`; parse a valid non-negative delta-seconds `Retry-After` only for the rate-limit result.
8. Map every terminal status/network/deadline/body outcome through the stable error mapper and normalize valid success responses.
9. Inject fetch, clock, sleep, and signal dependencies where required for deterministic tests.

Verification:

- `pnpm exec vitest run tests/unit/tinyfish-client.test.ts` succeeds.
- `pnpm typecheck` succeeds.
- Tests prove the attempt count never exceeds two and total simulated elapsed budget never exceeds 10 seconds.
- Branch coverage for retry/deadline and error mapping is 100%.

Completion criteria:

- Both internal search kinds produce the exact approved TinyFish requests.
- Timeout, retry, cancellation, status mapping, response limits, and normalization are deterministic and fully tested.
- No client path logs or returns a credential, URL containing query values, raw provider body, or arbitrary exception text.

Implementation notes:

- Implemented TinyFish URL serialization, fixed domain types, X-API-Key-only provider auth, no-store fetch, 10-second shared deadline, one eligible 250 ms retry, non-retry 4xx mapping, Retry-After parsing, cancellation handling, and tests. Verified with pnpm test --coverage and pnpm typecheck.

### TASK-005 — Register the two MCP tools and result contract

Status: Completed

Requirements: REQ-F-003, REQ-F-006, REQ-F-007, REQ-F-008, REQ-F-009, REQ-F-010, REQ-F-011, REQ-F-015, REQ-F-017, REQ-NF-002, REQ-NF-007, REQ-NF-008

Design: DES-004, DES-005, DES-006, DES-007, DES-008

Dependencies: TASK-002, TASK-003, TASK-004

Expected file or component changes:

- `src/mcp/results.ts` — construct equivalent structured/text success results and structured/text `isError` results.
- `src/mcp/tools.ts` — register exactly `web_search` and `news_search` with approved descriptions and schemas.
- `src/mcp/server.ts` — create a request-local `McpServer`, register tools, and bind request-local context/cancellation.
- `tests/unit/mcp-results.test.ts` — verify structured/text equivalence and sanitization.
- `tests/integration/mcp-tools.test.ts` — verify discovery and tool calls against a mocked TinyFish client.

Steps:

1. Construct the request-local MCP server with name `web-search-mcp` and the package version.
2. Register exactly the two approved tools, with descriptions that clearly distinguish ordinary web and news intent.
3. Bind both tools to the same strict input/output schemas and pass only the internal fixed search kind to the TinyFish client.
4. Use the SDK-provided caller cancellation signal for the client operation.
5. Return normalized success as both `structuredContent` and equivalent deterministic JSON text.
6. Return stable tool errors as both structured/text content with `isError: true`.
7. Return `CONFIGURATION_ERROR` when TinyFish configuration is absent while allowing server initialization and discovery.
8. Add contract tests proving no resource, prompt, logging, sampling, elicitation, task, or third tool capability is registered.

Verification:

- `pnpm exec vitest run tests/unit/mcp-results.test.ts tests/integration/mcp-tools.test.ts` succeeds.
- `pnpm typecheck` succeeds.
- Tool discovery returns exactly `web_search` and `news_search`.
- Parsed text and `structuredContent` are deeply equal for success and every error category.

Completion criteria:

- Both tools implement the approved names, descriptions, schemas, fixed provider mapping, cancellation, success, and error contracts.
- Discovery works without a TinyFish key, while search calls fail safely when it is absent.
- No excluded MCP capability or tool is advertised.

Implementation notes:

- Registered exactly web_search and news_search on a request-local McpServer, returned equivalent structured/text success and error results, and preserved safe configuration failure behavior. Verified with pnpm test --coverage and pnpm typecheck.

### TASK-006 — Integrate telemetry and the stateless Next.js MCP route

Status: Completed

Requirements: REQ-F-001, REQ-F-002, REQ-F-012, REQ-F-016, REQ-F-017, REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-007

Design: DES-001, DES-002, DES-003, DES-004, DES-009

Dependencies: TASK-003, TASK-005

Expected file or component changes:

- `src/telemetry.ts` — generate request IDs, measure elapsed time, allowlist event fields/categories, and emit exactly one JSON event.
- `src/http/handler.ts` — compose security, request context, telemetry, headers, method handling, and MCP POST lifecycle.
- `app/mcp/route.ts` — export Node.js runtime, 15-second duration, and handlers for supported/non-supported methods.
- `tests/unit/telemetry.test.ts` — verify field allowlist and forbidden-data absence.
- `tests/integration/mcp-route.test.ts` — verify HTTP security, JSON transport, lifecycle cleanup, headers, methods, and protocol behavior.

Steps:

1. Generate a `crypto.randomUUID()` request ID and monotonic start time for every `/mcp` request.
2. Apply Origin and configuration/authentication checks before passing any body to the MCP SDK.
3. For authenticated POST, create a fresh MCP server and `WebStandardStreamableHTTPServerTransport` with `sessionIdGenerator: undefined` and `enableJsonResponse: true`.
4. Connect, handle exactly one Web `Request`, return the Web `Response` with `Cache-Control: no-store` and `X-Request-ID`, and close server/transport in `finally`.
5. Return authenticated `405` with `Allow: POST` for GET, DELETE, HEAD, OPTIONS, PUT, and PATCH; export no SSE/message route.
6. Emit exactly one allowlisted JSON telemetry event on success, tool error, rejection, protocol error, and cancellation.
7. Ensure SDK logging capability is not registered or called.
8. Add integration tests for JSON `Content-Type`, accepted notifications, cleanup on all exit paths, no session ID, and absence of SSE behavior.

Verification:

- `pnpm exec vitest run tests/unit/telemetry.test.ts tests/integration/mcp-route.test.ts` succeeds.
- `pnpm typecheck` succeeds.
- An authenticated initialize/list/call sequence returns JSON and never sets `MCP-Session-Id` or `Content-Type: text/event-stream`.
- GET and DELETE return `405`; invalid Origin returns `403`; invalid bearer returns `401`; missing auth configuration returns `503`.
- Captured application logs contain exactly the five permitted field names and no forbidden value.

Completion criteria:

- `/mcp` is a stateless JSON Streamable HTTP route using a fresh official SDK transport per POST.
- HTTP security occurs before MCP parsing, all route responses are no-store/request-ID tagged, and resource cleanup is guaranteed.
- Exactly one sanitized telemetry event is emitted per request.

Implementation notes:

- Integrated stateless /mcp route, WebStandardStreamableHTTPServerTransport with stateless JSON options, pre-body security checks, no-store/request ID headers, cleanup finally blocks, and one allowlisted telemetry event per request. Verified with pnpm test --coverage, pnpm typecheck, and pnpm build.

### TASK-007 — Complete contract, concurrency, capacity, and release verification

Status: Completed

Requirements: REQ-F-001, REQ-F-002, REQ-F-003, REQ-F-004, REQ-F-005, REQ-F-006, REQ-F-007, REQ-F-008, REQ-F-009, REQ-F-010, REQ-F-011, REQ-F-012, REQ-F-013, REQ-F-014, REQ-F-015, REQ-F-016, REQ-F-017, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-005, REQ-NF-006, REQ-NF-007, REQ-NF-008

Design: DES-009, DES-010

Dependencies: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006

Expected file or component changes:

- `tests/integration/mcp-contract.test.ts` — cover the complete authenticated protocol/tool contract and all acceptance categories.
- `tests/integration/concurrency.test.ts` — cover five-call isolation, cancellation isolation, and request IDs.
- `tests/integration/capacity.test.ts` — exercise 30 mocked calls at the approved aggregate rate without an internal queue.
- `tests/fixtures/` — provide sanitized deterministic TinyFish/protocol fixtures only.
- `vitest.config.ts` — finalize file-specific and overall coverage thresholds/exclusions.

Steps:

1. Build a complete requirements-to-test matrix from the approved acceptance criteria.
2. Add handler-level tests for initialization, discovery, both tools, all fields, empty results, optional news metadata, every validation rule, every error category, and every HTTP rejection.
3. Verify query parameters appear exactly once and `domain_type` cannot be overridden.
4. Verify five simultaneous calls use independent request IDs, inputs, outputs, abort signals, deadlines, and telemetry.
5. Exercise 30 mocked calls at the approved aggregate rate and prove the application creates no internal queue or shared mutable request state.
6. Add explicit negative assertions for credentials, authorization headers, queries, results, raw provider bodies, exception messages, and stack traces across responses/logs.
7. Run and satisfy the file-specific 100% branch thresholds and overall 90% statement threshold.
8. Run the complete release gate from a fresh frozen install using pnpm 10.28.1 and the approved dependency source; do not update the lockfile or fall back to another registry, package manager, or version.

Verification:

- `pnpm --version` reports 10.28.1 without a package-manager download or activation step.
- `pnpm install --frozen-lockfile` succeeds through the configured approved registry/mirror; when the approved source is the pre-populated store, `pnpm install --offline --frozen-lockfile` succeeds instead.
- `pnpm lint` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm test --coverage` succeeds at all approved thresholds.
- `pnpm build` succeeds for the production Next.js route.
- Inspection confirms the frozen install did not modify `pnpm-lock.yaml`.

Completion criteria:

- Every approved requirement and acceptance criterion has a passing automated test or the explicit deployment verification assigned later.
- Concurrency/capacity tests prove isolation and absence of an internal queue.
- The complete release gate succeeds without production credentials or live TinyFish access.

Implementation notes:

- Added mocked contract, security, TinyFish, telemetry, route, smoke, coverage, frozen-install, lint, typecheck, test coverage, and build verification. Coverage: statements 97.36%, branches 95.45%, functions 100%, lines 100%. Frozen install left pnpm-lock.yaml unchanged.

### TASK-008 — Document operation and add the opt-in deployment smoke test

Status: Completed

Requirements: REQ-F-002, REQ-F-003, REQ-F-012, REQ-F-015, REQ-F-017, REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004

Design: DES-010, DES-011

Dependencies: TASK-006, TASK-007

Expected file or component changes:

- `README.md` — document architecture, prerequisites, Vercel setup, client headers, tools, filters, errors, privacy, tests, rollout, and rollback.
- `.env.example` — list environment variable names with clearly fake example markers only.
- `.gitignore` — exclude local environment files, Vercel local metadata, dependencies, build output, and coverage output.
- `scripts/smoke.mjs` — implement an explicit opt-in remote MCP smoke test with fixed benign queries and redacted output.
- `package.json` — connect the existing `smoke` script to the finalized script.
- `tests/unit/smoke-script.test.ts` — verify help/dry-run behavior and redaction without network access.

Steps:

1. Document Node.js 24, the preinstalled pnpm 10.28.1 policy, the prohibition on Corepack/package-manager downloads and proxy bypasses, the approved registry/mirror/offline-store choices, exact frozen-install and quality commands, and the two required Vercel environment variables without sample secret values.
2. Document generation of a high-entropy bearer token, separate Preview/Production values, client `Authorization` configuration, and rotation guidance.
3. Document both tools, input constraints, result fields, stable errors, 10-second deadline, capacity target, and explicit exclusions.
4. Document Preview-first rollout, production promotion, prior-deployment rollback, and when to rotate either credential.
5. Implement a smoke script that requires an explicit deployment URL and token, checks unauthenticated rejection, authenticated initialization/discovery, and one fixed benign web/news query, while never printing token/query/result/provider body.
6. Ensure `--help` and a no-network validation mode require no secret; live execution must be opt-in and excluded from default CI.
7. Verify local environment files and Vercel metadata cannot be committed accidentally.
8. Document that registry `403` responses or an incomplete offline store leave TASK-001 Blocked and require an operator-provided approved dependency source; do not recommend changing package managers, omitting the lockfile, disabling frozen installs, or bypassing the configured proxy.

Verification:

- `node scripts/smoke.mjs --help` succeeds without network or secrets.
- `pnpm exec vitest run tests/unit/smoke-script.test.ts` succeeds.
- `pnpm lint`, `pnpm typecheck`, `pnpm test --coverage`, and `pnpm build` remain successful.
- Inspection confirms the README and example files contain no real credential, query history, result content, or unapproved capability.

Completion criteria:

- A new operator can configure, test, connect, deploy, roll back, and rotate credentials using the documentation.
- A new implementer can distinguish offline package-manager bootstrap from dependency installation and diagnose a blocked dependency source without weakening reproducibility or network policy.
- The smoke test is safe, redacted, opt-in, and not part of default CI.
- No documentation or ignored file weakens the approved privacy/security boundary.

Implementation notes:

- Added README, .env.example, .gitignore, and opt-in redacted smoke script with help/dry-run unit coverage. Verified node scripts/smoke.mjs --help, pnpm test --coverage, lint, typecheck, and build.

### TASK-009 — Deploy and verify the Vercel Preview

Status: Blocked

Requirements: REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-005, REQ-NF-006, REQ-NF-007

Design: DES-011

Dependencies: TASK-007, TASK-008

Expected file or component changes:

- Vercel Preview deployment — create only after explicit user authorization and successful connector/preflight access.
- Vercel Preview environment — configure separate `MCP_AUTH_TOKEN` and `TINYFISH_API_KEY` values through Vercel, never through repository files.
- `tasks.md` implementation notes — record only sanitized deployment identifier/URL, commands, timestamps, smoke outcomes, and log inspection evidence.

Steps:

1. Confirm explicit authorization for the external Preview deployment and verify Vercel access with a harmless read-only project/team action; otherwise mark this task Blocked.
2. Re-run the complete release gate against the exact source state to deploy.
3. Configure separate Preview secrets in the Vercel project without displaying or copying their values into logs/specifications.
4. Deploy that exact source state to a Vercel Hobby Preview.
5. Run the opt-in smoke test against Preview.
6. Exercise five simultaneous mocked-or-benign calls and the approved request-rate scenario without exposing sensitive output.
7. Inspect Vercel runtime logs and confirm only the approved telemetry fields appear.
8. Record sanitized verification evidence and any Hobby-specific observations in implementation notes.

Verification:

- The Vercel deployment reports Ready on a Hobby project.
- The smoke test succeeds for rejection, initialization/discovery, `web_search`, and `news_search`.
- Preview response timing respects the 10-second provider timeout and 15-second function limit.
- Runtime logs contain no query, result, header, token, API key, provider body, exception message, or stack trace.
- The five-concurrent and 30-per-minute target yields isolated valid successes or approved sanitized errors without an internal queue.

Completion criteria:

- The exact quality-gated source is running successfully on an authorized Vercel Hobby Preview.
- Every deployment-relevant acceptance criterion is verified with sanitized evidence.
- Preview secrets remain confined to Vercel configuration.

Implementation notes:

- Blocked before external Preview deployment because this turn has no explicit authorization for a Vercel Preview deployment and no Vercel read-only access check was authorized/performed.

### TASK-010 — Promote the verified deployment and confirm rollback readiness

Status: Pending

Requirements: REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-007

Design: DES-011

Dependencies: TASK-009

Expected file or component changes:

- Vercel Production deployment — promote the exact verified Preview build only after explicit user authorization.
- Vercel Production environment — configure/verify production-only secrets without exposing them.
- `tasks.md` implementation notes — record sanitized promotion, production smoke, monitoring, and rollback evidence.

Steps:

1. Present the verified Preview outcome and obtain explicit authorization for Production promotion; otherwise mark this task Blocked.
2. Verify Production has separate configured values for both required environment variables without retrieving or displaying them.
3. Promote the exact verified deployment artifact/source state rather than rebuilding unverified changes.
4. Run the minimal opt-in production smoke test and inspect only sanitized runtime telemetry.
5. Identify the previous known-good Production deployment and verify that Vercel can restore it without a data migration.
6. Record the sanitized production and rollback-readiness evidence.
7. Rotate `MCP_AUTH_TOKEN` or the TinyFish key only if the user authorizes rotation after suspected exposure.

Verification:

- Production reports Ready and corresponds to the verified Preview source/version.
- Minimal authenticated discovery and both fixed benign search smoke calls succeed.
- Unauthorized access remains `401`, mismatched Origin remains `403`, and responses/logs remain sanitized.
- A previous known-good deployment is identified as the rollback target and restoration instructions are verified without executing an unnecessary rollback.

Completion criteria:

- The authorized exact Preview build is promoted successfully to Production and passes the minimal smoke test.
- Rollback is immediately actionable and requires no state/data migration.
- No credential value or sensitive search content is recorded in implementation notes or logs.

Implementation notes:

- Pending; depends on TASK-009 Preview completion and separate explicit Production promotion authorization.

## Coverage matrix

| Requirement or design ID | Implementing tasks |
|---|---|
| REQ-F-001 | TASK-006, TASK-007 |
| REQ-F-002 | TASK-003, TASK-006, TASK-007, TASK-008 |
| REQ-F-003 | TASK-005, TASK-007, TASK-008 |
| REQ-F-004 | TASK-002, TASK-007 |
| REQ-F-005 | TASK-002, TASK-007 |
| REQ-F-006 | TASK-004, TASK-005, TASK-007 |
| REQ-F-007 | TASK-004, TASK-005, TASK-007 |
| REQ-F-008 | TASK-002, TASK-005, TASK-007 |
| REQ-F-009 | TASK-005, TASK-007 |
| REQ-F-010 | TASK-002, TASK-005, TASK-007 |
| REQ-F-011 | TASK-002, TASK-005, TASK-007 |
| REQ-F-012 | TASK-003, TASK-004, TASK-006, TASK-007, TASK-008 |
| REQ-F-013 | TASK-004, TASK-007 |
| REQ-F-014 | TASK-004, TASK-007 |
| REQ-F-015 | TASK-003, TASK-004, TASK-005, TASK-007, TASK-008 |
| REQ-F-016 | TASK-006, TASK-007 |
| REQ-F-017 | TASK-005, TASK-006, TASK-007, TASK-008 |
| REQ-NF-001 | TASK-001, TASK-006, TASK-008, TASK-009, TASK-010 |
| REQ-NF-002 | TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010 |
| REQ-NF-003 | TASK-003, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010 |
| REQ-NF-004 | TASK-003, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010 |
| REQ-NF-005 | TASK-004, TASK-007, TASK-009 |
| REQ-NF-006 | TASK-007, TASK-009 |
| REQ-NF-007 | TASK-004, TASK-005, TASK-006, TASK-007, TASK-009, TASK-010 |
| REQ-NF-008 | TASK-001, TASK-002, TASK-005, TASK-007 |
| DES-001 | TASK-006 |
| DES-002 | TASK-003, TASK-006 |
| DES-003 | TASK-003, TASK-006 |
| DES-004 | TASK-005, TASK-006 |
| DES-005 | TASK-002, TASK-005 |
| DES-006 | TASK-004, TASK-005 |
| DES-007 | TASK-002, TASK-004, TASK-005 |
| DES-008 | TASK-002, TASK-004, TASK-005 |
| DES-009 | TASK-006, TASK-007 |
| DES-010 | TASK-001, TASK-007, TASK-008 |
| DES-011 | TASK-008, TASK-009, TASK-010 |
