# Local decisions

This directory records Mini Program implementation decisions only. The canonical cross-platform WeChat identity/session ADR lives in Admin Web under WECHAT-001 and is referenced, not duplicated.

Initial local constraints: native TypeScript; read-only; default-OFF feature; Admin-owned backend/migrations; bounded polling unless a supported private Realtime path is proven.

- [DEC-001 — Native TypeScript and bounded polling](DEC-001-native-typescript-bounded-polling.md)
