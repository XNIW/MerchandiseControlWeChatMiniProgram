# DEC-001 — Native TypeScript and bounded polling

Status: accepted locally for review, 2026-08-12. Parent: WECHAT-001.

The Mini Program uses the native WeChat runtime and TypeScript with official `miniprogram-api-typings`. It introduces no cross-platform framework and no client Realtime protocol implementation. Under WECHAT-002 the temporary fallback refreshes adaptively: three seconds after success, exponential backoff up to thirty seconds after errors, immediate foreground/pull refresh, and no timer while hidden or unloaded. Requests use sequence guards and paginated IDs are deduplicated.

This is described only as “Automatic update” and explicitly “not realtime”. WMP-012 remains `REVIEW / CHANGES_REQUIRED`. A private invalidation channel may replace polling only after official Mini Program WebSocket/runtime compatibility, authenticated shop-topic authorization, reconnect/JWT refresh, revocation, burst/deduplication and sensitive-payload tests are demonstrated. The canonical identity architecture remains Admin Web ADR-002 and is not re-decided here.
