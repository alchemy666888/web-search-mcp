export type SearchKind='web'|'news';
export type SearchInput={query:string;purpose?:string;location?:string;language?:string;include_domains?:string;exclude_domains?:string;recency_minutes?:number;after_date?:string;before_date?:string;page?:number};
export type SearchResult={position:number;site_name?:string;title:string;snippet:string;url:string;date?:string;publisher?:string};
export type NormalizedSearch={query:string;results:SearchResult[];total_results:number;page:number};
export type ErrorCode='INVALID_INPUT'|'CONFIGURATION_ERROR'|'UPSTREAM_REJECTED'|'UPSTREAM_RATE_LIMITED'|'UPSTREAM_UNAVAILABLE'|'UPSTREAM_TIMEOUT'|'UPSTREAM_INVALID_RESPONSE'|'REQUEST_CANCELLED';
export type ToolError={error:{code:ErrorCode;message:string;provider_code?:string;retry_after_seconds?:number}};
