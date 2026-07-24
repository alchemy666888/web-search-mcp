# Requirements: Web Search MCP

Status: Approved

## Objective

Provide a private, remotely hosted MCP server that lets an AI agent perform ordinary web searches and news searches through TinyFish while keeping TinyFish credentials server-side.

Success means an authenticated MCP client can discover and call two predictable search tools, receive structured ranked results, and handle validation, rate-limit, timeout, and upstream failures without exposure of secrets or raw upstream error bodies.

## Background

TinyFish exposes ranked web and news results through one Search API. The API selects ordinary web results with `domain_type=web` and news results with `domain_type=news`; news results may add `publisher` and `date`. It authenticates REST calls with `X-API-Key` and supports purpose, locale, domain, freshness, date, and page filters. The relevant provider documentation is the [Search API reference](https://docs.tinyfish.ai/search-api/reference), [Search examples](https://docs.tinyfish.ai/search-api/examples), [authentication guide](https://docs.tinyfish.ai/authentication), and [MCP integration guide](https://docs.tinyfish.ai/mcp-integration).

The project is greenfield. It will wrap the TinyFish Search API in an agent-oriented, stateless MCP service deployed to Vercel Cloud on the Hobby plan.

## Stakeholders and users

- Primary user: the owner operating private AI agents.
- Calling systems: standards-compliant MCP clients capable of Streamable HTTP and a bearer authorization header.
- Operator and maintainer: the owner of the Vercel deployment, TinyFish account, and two deployment secrets.
- External dependency owner: TinyFish, which controls search behavior, result availability, upstream limits, and the Search API contract.

## Scope

### In scope

- A remote, stateless MCP endpoint at `/mcp`.
- Bearer-token protection for every MCP request.
- Exactly two tools: `web_search` and `news_search`.
- TinyFish-compatible search inputs and validation.
- Ranked structured result metadata suitable for AI-agent consumption.
- Bounded timeout and transient retry behavior.
- Sanitized operational errors and minimal, privacy-preserving telemetry.
- Deployment compatibility with Vercel Cloud Hobby plan.

### Boundaries

- The deployment is private and single-tenant.
- One `MCP_AUTH_TOKEN` authorizes all clients.
- One `TINYFISH_API_KEY` identifies the TinyFish account used for all upstream calls.
- TinyFish Search API is the only v1 search provider.
- The service is stateless and has no internal work queue.
- Capacity is limited to 30 tool calls per minute and five concurrent calls per deployment.

## Functional requirements

| ID | Requirement | Rationale |
|---|---|---|
| REQ-F-001 | The service must expose a stateless MCP Streamable HTTP endpoint at `/mcp`. | Remote AI agents need a standards-based endpoint compatible with Vercel serverless execution. |
| REQ-F-002 | The service must reject every request whose `Authorization` header is missing, malformed, or does not contain the configured `MCP_AUTH_TOKEN`, returning HTTP `401` without calling TinyFish. | The private endpoint and upstream quota must not be publicly usable. |
| REQ-F-003 | The MCP server must advertise exactly two search tools named `web_search` and `news_search`. | Agents need an explicit choice between ordinary web and news results without selecting a provider domain type themselves. |
| REQ-F-004 | Each tool must accept a required non-empty string `query` and these optional TinyFish-compatible inputs: string `purpose`, string `location`, string `language`, comma-separated string `include_domains`, comma-separated string `exclude_domains`, integer `recency_minutes`, string `after_date`, string `before_date`, and integer `page`. | The v1 wrapper must retain the useful web/news search controls documented by TinyFish without adding wrapper-specific filter types. |
| REQ-F-005 | The service must validate tool inputs before making an upstream request: `purpose` must not exceed 2,000 characters; `recency_minutes` must be an integer from 1 through 5,256,000; dates must use valid `YYYY-MM-DD` format; `recency_minutes` must not be combined with either date filter; `after_date` must not be later than `before_date` when both are present; and `page` must be an integer from 0 through 10. | Local validation gives agents deterministic feedback and avoids unnecessary upstream calls. |
| REQ-F-006 | `web_search` must call the TinyFish Search API with `domain_type=web`, regardless of client-supplied data, and forward every validated supported filter using its corresponding TinyFish parameter. | The tool must always perform an ordinary web search and must not permit domain-type override. |
| REQ-F-007 | `news_search` must call the TinyFish Search API with `domain_type=news`, regardless of client-supplied data, and forward every validated supported filter using its corresponding TinyFish parameter. | The tool must always perform a news search and must not permit domain-type override. |
| REQ-F-008 | Each successful tool call must return normalized fields `query`, `results`, `total_results`, and `page`; every result must preserve available TinyFish fields `position`, `site_name`, `title`, `snippet`, and `url`; news results must also preserve available `date` and `publisher` fields. | Agents need stable, ranked search metadata without losing news-specific attribution. |
| REQ-F-009 | Each successful tool call must provide the normalized response as MCP `structuredContent` and as equivalent JSON text content. | Both structured-output-aware clients and clients using text fallback must receive the same information. |
| REQ-F-010 | An empty TinyFish result set must be returned as a successful response with an empty `results` array and the provider-supplied pagination metadata. | No results is a valid search outcome, not a tool failure. |
| REQ-F-011 | Invalid input and upstream failures must be returned as MCP tool errors with `isError: true`, a stable sanitized error code, a safe human-readable message, and a safe retry hint when available. | Agents need actionable failures without receiving secrets or unstable raw provider bodies. |
| REQ-F-012 | The service must never include either configured secret, the authorization header, or an unfiltered TinyFish error body in a response or log. | Credentials and potentially sensitive upstream details must remain private. |
| REQ-F-013 | Each tool call must enforce a 10-second overall TinyFish deadline and may retry at most once within that same deadline for a transient network failure or TinyFish HTTP `500` or `503`. | Search calls should fail predictably while tolerating a brief transient outage. |
| REQ-F-014 | The service must not retry TinyFish `4xx` responses, including `429`; for `429`, it must preserve a safe `Retry-After` hint when TinyFish supplies one. | Retrying invalid, unauthorized, payment, forbidden, or rate-limited requests would add load or latency without a guaranteed benefit. |
| REQ-F-015 | If either required environment variable is absent, the service must fail closed, avoid calling TinyFish, and return a sanitized configuration error that does not identify or reveal the missing value. | A misconfigured deployment must not become public or leak configuration details. |
| REQ-F-016 | Application telemetry must be limited to request ID, tool name, outcome status, elapsed time, and sanitized error code. | The operator needs basic diagnostics without retaining search activity. |
| REQ-F-017 | The service must not persist or cache search queries, search results, authorization data, or TinyFish credentials. | The confirmed service model is stateless and privacy-minimizing. |

## Non-functional requirements

| ID | Quality attribute | Measurable requirement |
|---|---|---|
| REQ-NF-001 | Deployment compatibility | The production build and runtime must deploy and execute within the current Vercel Cloud Hobby plan without any paid-only Vercel service. |
| REQ-NF-002 | Protocol interoperability | A standards-compliant MCP client using Streamable HTTP must be able to initialize, list tools, and invoke both tools through `/mcp`. |
| REQ-NF-003 | Security | All `/mcp` requests must be denied with HTTP `401` before tool execution when bearer authentication fails; secrets must be read only from server-side environment variables and must not be present in client-visible artifacts. |
| REQ-NF-004 | Privacy | Across successful calls, validation failures, upstream failures, and diagnostic output, application-controlled persistent storage and logs must contain zero query strings, result contents, bearer tokens, or TinyFish API keys. |
| REQ-NF-005 | Latency bound | Every TinyFish operation must stop attempting upstream work when its 10-second overall deadline expires and return a timeout tool error. |
| REQ-NF-006 | Capacity | The service must correctly handle five simultaneous tool calls and a sustained aggregate rate of 30 tool calls per minute without an internal queue; upstream quota exhaustion may produce the defined rate-limit tool error. |
| REQ-NF-007 | Failure isolation | A failed, timed-out, or cancelled tool call must not retain mutable state or affect the inputs or outputs of another call. |
| REQ-NF-008 | Contract stability | Tool names, input field names and types, success fields, and documented error-code categories must be verified by automated contract tests before release. |

## Constraints

- The project and specification directory are named `web-search-mcp` and `specs/web-search-mcp/`.
- The implementation must target Vercel Cloud Hobby plan.
- Runtime secrets are supplied as Vercel environment variables named `MCP_AUTH_TOKEN` and `TINYFISH_API_KEY`.
- TinyFish Search API is the sole search backend in v1.
- TinyFish REST authentication uses the `X-API-Key` header.
- The MCP endpoint uses Streamable HTTP at `/mcp`.
- The server is private, stateless, and single-tenant.
- Domain filters use TinyFish’s comma-separated string representation.
- TinyFish’s documented lowest search limit is 30 requests per minute; actual account access and quota remain external dependencies.

## Confirmed assumptions

- Calling agents can connect to a remote Streamable HTTP MCP server and attach an `Authorization: Bearer …` header.
- The operator will configure both required environment variables in every Vercel environment that is expected to serve MCP requests.
- One shared bearer token and one TinyFish account are sufficient for the intended private use.
- Search-result snippets and metadata, rather than fetched page content, satisfy the v1 agent use case.

## Dependencies

- TinyFish Search API at `GET https://api.search.tinyfish.ai`.
- TinyFish account access and the rate limit associated with the configured API key.
- TinyFish web and news result schemas and filter semantics described in its current documentation.
- Vercel Cloud Hobby plan serverless runtime and environment-variable support.
- An MCP implementation capable of stateless Streamable HTTP, tool schemas, `structuredContent`, JSON text content, and tool errors.
- MCP clients capable of providing a bearer authorization header.

## Edge cases

| ID | Scenario | Required behavior |
|---|---|---|
| EDGE-001 | The authorization header is missing, does not use the Bearer scheme, contains an empty token, or contains the wrong token. | Return HTTP `401`, disclose no secret/configuration details, and make no TinyFish call. |
| EDGE-002 | `query` is missing, empty, or not a string. | Return a sanitized invalid-input tool error and make no TinyFish call. |
| EDGE-003 | A filter has the wrong type, is outside its documented range, or contains an invalid date. | Return a sanitized invalid-input tool error identifying the invalid field and make no TinyFish call. |
| EDGE-004 | `recency_minutes` is combined with `after_date` or `before_date`. | Return a sanitized invalid-input tool error and make no TinyFish call. |
| EDGE-005 | Both dates are valid but `after_date` is later than `before_date`. | Return a sanitized invalid-input tool error and make no TinyFish call. |
| EDGE-006 | TinyFish returns no results. | Return success with `results: []` and the normalized top-level metadata. |
| EDGE-007 | TinyFish returns optional `date` or `publisher` fields for only some results. | Preserve fields where present and do not synthesize values where absent. |
| EDGE-008 | TinyFish returns HTTP `429` with `Retry-After`. | Do not retry; return a sanitized rate-limit tool error containing the safe retry hint. |
| EDGE-009 | TinyFish returns HTTP `500`, HTTP `503`, or a transient network failure. | Retry no more than once if the 10-second overall deadline permits, then return success or a sanitized upstream-unavailable tool error. |
| EDGE-010 | TinyFish does not complete within the 10-second overall deadline. | Cancel or abandon the upstream attempt and return a sanitized timeout tool error. |
| EDGE-011 | TinyFish returns any other non-success response or a malformed success body. | Do not expose the raw response; return the applicable sanitized upstream tool error. |
| EDGE-012 | A required environment variable is absent. | Fail closed, make no TinyFish call, and return only a sanitized configuration error. |
| EDGE-013 | Five calls are already executing concurrently. | The service must not corrupt or share request state; any platform or upstream refusal must be returned as a sanitized error without internal queueing. |

## Acceptance criteria

| ID | Related requirements | Criterion |
|---|---|---|
| AC-001 | REQ-F-001, REQ-NF-002 | Given a deployed service and valid bearer token, when a compliant client initializes through `/mcp`, then initialization succeeds and tool discovery lists the server’s tools. |
| AC-002 | REQ-F-002, REQ-NF-003, EDGE-001 | Given a missing, malformed, or incorrect bearer token, when `/mcp` is requested, then HTTP `401` is returned, no TinyFish request occurs, and no secret/configuration detail appears. |
| AC-003 | REQ-F-003 | Given an authenticated initialized client, when it lists tools, then the search tool names are exactly `web_search` and `news_search`, with no other tool advertised. |
| AC-004 | REQ-F-004, REQ-F-005, EDGE-002, EDGE-003, EDGE-004, EDGE-005 | Given each invalid required field, type, range, date, or filter combination, when either tool is invoked, then it returns the invalid-input tool error and the TinyFish test double records zero calls. |
| AC-005 | REQ-F-006 | Given valid `web_search` inputs, when the tool runs, then the TinyFish request contains `domain_type=web`, contains each supplied supported filter exactly once, and cannot be overridden to another domain type. |
| AC-006 | REQ-F-007 | Given valid `news_search` inputs, when the tool runs, then the TinyFish request contains `domain_type=news`, contains each supplied supported filter exactly once, and cannot be overridden to another domain type. |
| AC-007 | REQ-F-008, REQ-F-009 | Given a successful TinyFish response, when either tool completes, then `structuredContent` and parsed JSON text contain equivalent normalized top-level and result fields in the same ranking order. |
| AC-008 | REQ-F-008, EDGE-007 | Given news results with mixed optional metadata, when `news_search` completes, then each available `date` and `publisher` is preserved on its source result and no missing field is fabricated. |
| AC-009 | REQ-F-010, EDGE-006 | Given a successful TinyFish response with no results, when a tool completes, then it reports success with `results: []` and normalized pagination metadata. |
| AC-010 | REQ-F-011, REQ-F-012, REQ-F-014, EDGE-008, EDGE-011 | Given each non-retryable TinyFish error class, when a tool completes, then `isError` is true, the response has a stable sanitized error code and safe message, any safe retry hint is preserved, and no raw body or secret is present. |
| AC-011 | REQ-F-013, EDGE-009 | Given a transient failure followed by success within 10 seconds, when a tool runs, then exactly two upstream attempts occur and the tool succeeds; given two transient failures, it returns the upstream-unavailable error after exactly two attempts. |
| AC-012 | REQ-F-013, REQ-NF-005, EDGE-010 | Given an upstream request that does not complete, when the overall deadline reaches 10 seconds, then no further attempt begins and a timeout tool error is returned. |
| AC-013 | REQ-F-015, EDGE-012 | Given either required environment variable is absent, when the service receives a request requiring that variable, then it fails closed, makes no TinyFish call, and does not identify or expose the missing value. |
| AC-014 | REQ-F-016, REQ-F-017, REQ-NF-004 | Given representative successes and every failure class, when application telemetry and storage are inspected, then they contain only the permitted operational fields and contain no query, result, token, API key, history, database entry, or cache entry. |
| AC-015 | REQ-NF-001 | Given the production configuration, when it is built and deployed to a Vercel Hobby project, then deployment succeeds without enabling a paid-only Vercel service. |
| AC-016 | REQ-NF-006, REQ-NF-007, EDGE-013 | Given five simultaneous calls and an aggregate 30-call-per-minute test rate, when calls execute, then request/response data remains isolated, no internal queue is used, and every call ends in its own valid success or sanitized error. |
| AC-017 | REQ-NF-008 | Given the release test command, when it completes successfully, then automated contract tests have verified both tool schemas, success representations, authentication behavior, and every documented error-code category. |

## NOT-TO-DOs

| ID | Explicit exclusion | Reason |
|---|---|---|
| NTD-001 | Do not implement a research-paper search tool or expose `domain_type` to callers. | v1 contains only ordinary web and news tools. |
| NTD-002 | Do not integrate another search provider or create a pluggable provider abstraction. | TinyFish is the confirmed sole v1 backend. |
| NTD-003 | Do not fetch, crawl, scrape, or open result URLs. | v1 returns search metadata only. |
| NTD-004 | Do not summarize, rerank, deduplicate, enrich, or otherwise transform the semantic content of results. | TinyFish ranking and metadata must be preserved. |
| NTD-005 | Do not add a database, persistent store, result cache, query history, analytics pipeline, or internal work queue. | The service is stateless and privacy-minimizing. |
| NTD-006 | Do not implement OAuth, accounts, tenant isolation, per-user quotas, an admin UI, or a public signup flow. | The service is private and single-tenant. |
| NTD-007 | Do not implement local `stdio`, legacy SSE transport, or client-specific MCP endpoints. | v1 supports only generic Streamable HTTP at `/mcp`. |
| NTD-008 | Do not expose, echo, persist, or log `MCP_AUTH_TOKEN`, `TINYFISH_API_KEY`, authorization headers, raw TinyFish error bodies, query text, or result content. | Secrets and search activity must remain private. |
| NTD-009 | Do not add wrapper-specific domain-array syntax or a `max_results` parameter. | Inputs intentionally mirror the TinyFish web/news API contract. |
| NTD-010 | Do not add an application-level request queue or automatic retry for `4xx` responses. | The confirmed failure policy favors bounded latency and provider retry guidance. |

## Risks

| ID | Risk | Impact | Mitigation or decision |
|---|---|---|---|
| RISK-001 | TinyFish availability, ranking, schema, or limits may change. | Tool calls may fail or contract tests may detect incompatible results. | Isolate the provider call, validate responses, return sanitized upstream errors, and pin behavior to the current documented contract. |
| RISK-002 | A leaked shared bearer token permits use of the private deployment. | An unauthorized party could consume TinyFish quota and Vercel resources. | Store the token only as a Vercel secret, require it on every request, avoid logging it, and rotate it if compromise is suspected. |
| RISK-003 | Vercel Hobby runtime limits or cold starts may affect MCP behavior. | Requests may be delayed or terminated by the platform. | Use stateless bounded requests, a 10-second upstream deadline, no persistence, and deployment-level verification on Hobby. |
| RISK-004 | The lowest documented TinyFish rate limit equals the target 30 calls per minute. | Bursts or unrelated use of the same key may cause `429` responses. | Do not queue or retry `429`; expose a safe retry hint so the calling agent can defer. |
| RISK-005 | Search queries and result metadata are transmitted to TinyFish despite no local persistence. | Sensitive search intent leaves the Vercel execution boundary. | Document TinyFish as an external processor and avoid any additional storage or processors. |
| RISK-006 | TinyFish’s published OpenAPI artifact may lag its narrative Search API documentation. | Generated clients or assumptions based only on OpenAPI may omit current filters or fields. | Treat the current Search API reference and examples as the v1 contract and cover every exposed field with explicit tests. |

## Resolved decisions

| Topic | Confirmed decision | Basis |
|---|---|---|
| Project identity | Use `web-search-mcp` and `specs/web-search-mcp/`. | User confirmation. |
| Project context | Greenfield project. | Workspace inspection found no existing files or Git repository. |
| Search backend | TinyFish Search API only; no multi-provider abstraction. | User confirmation. |
| Hosting | Deploy to Vercel Cloud Hobby plan. | User confirmation. |
| Runtime secrets | Configure `TINYFISH_API_KEY` and `MCP_AUTH_TOKEN` as Vercel environment variables. | User confirmation. |
| Client authentication | Require a shared bearer token and return `401` for unauthorized requests. | User confirmation. |
| Tenancy | Private, single-tenant service for the owner’s agents. | User confirmation. |
| Protocol | Stateless MCP Streamable HTTP at `/mcp`; no legacy SSE or client-specific endpoint. | User confirmation. |
| Tools | Expose exactly `web_search` and `news_search`; exclude research-paper search. | User confirmation. |
| Input contract | Mirror TinyFish’s web/news filter names and scalar types, including comma-separated domain strings. | User confirmation. |
| Result boundary | Return ranked result metadata only; do not fetch or transform pages. | User confirmation. |
| Response contract | Return structured JSON plus equivalent JSON text; use sanitized MCP tool errors. | User confirmation. |
| Persistence and telemetry | No persistence, cache, history, analytics, query/result logging, or secret logging; retain only minimal sanitized operational fields. | User confirmation. |
| Failure policy | Use a 10-second overall deadline, one bounded transient retry, no `4xx` retry, and safe retry hints. | User confirmation. |
| Capacity | Support 30 calls per minute and five concurrent calls with no internal queue. | User confirmation. |

## Repository evidence

Not applicable — greenfield project.
