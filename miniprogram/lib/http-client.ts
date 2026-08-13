import {
  AuthContractError,
  type AuthErrorCode,
  CatalogMutationContractError,
  type CatalogMutationErrorCode,
} from "./contracts";
import type { MiniProgramPlatform, PlatformResponse } from "./platform";

const responseByteBudget = 131_072;
const requestIdentifierPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const knownErrors = new Set<AuthErrorCode>([
  "account_suspended",
  "backend_temporary",
  "code_expired",
  "code_invalid",
  "code_missing",
  "identity_already_linked",
  "identity_conflict",
  "membership_missing",
  "provider_not_configured",
  "rate_limited",
  "session_expired",
  "state_expired",
  "state_invalid",
  "state_replayed",
  "user_cancelled",
  "user_denied",
  "validation_failed",
]);
const knownCatalogMutationErrors = new Set<CatalogMutationErrorCode>([
  "account_suspended",
  "backend_temporary",
  "conflict",
  "duplicate_barcode",
  "entity_not_found",
  "idempotency_conflict",
  "image_invalid",
  "image_too_large",
  "invalid_category",
  "invalid_operation",
  "invalid_price",
  "invalid_state",
  "invalid_supplier",
  "membership_missing",
  "offline",
  "permission_denied",
  "profile_suspended",
  "rate_limited",
  "retryable_error",
  "session_expired",
  "shop_suspended",
  "stale_version",
  "unauthenticated",
  "validation_failed",
]);

export interface HttpPostOptions {
  readonly correlationId?: string;
  readonly deviceId?: string;
  readonly errorDomain?: "auth" | "catalog_mutation";
  readonly idempotencyKey?: string;
}

export interface HttpSession {
  readonly deviceId: string;
  readonly sessionToken: string;
}

export class HttpClient {
  readonly #baseUrl: string;
  readonly #platform: MiniProgramPlatform;

  constructor(baseUrl: string, platform: MiniProgramPlatform) {
    if (!/^https:\/\/[A-Za-z0-9.-]+(?::[1-9][0-9]{0,4})?\/?$/.test(baseUrl)) {
      throw new AuthContractError("provider_not_configured");
    }
    this.#baseUrl = baseUrl.replace(/\/$/, "");
    this.#platform = platform;
  }

  async get<T>(
    path: string,
    query: Readonly<Record<string, boolean | number | string | undefined>>,
    session: HttpSession,
  ): Promise<T> {
    this.#validatePath(path);
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    const url = `${this.#baseUrl}${path}${pairs.length === 0 ? "" : `?${pairs.join("&")}`}`;
    return this.#request<T>("GET", url, undefined, session);
  }

  async post<T>(
    path: string,
    body: unknown,
    session?: HttpSession,
    options: HttpPostOptions = {},
  ): Promise<T> {
    this.#validatePath(path);
    this.#validatePostOptions(options);
    return this.#request<T>("POST", `${this.#baseUrl}${path}`, body, session, options);
  }

  async #request<T>(
    method: "GET" | "POST",
    url: string,
    data?: unknown,
    session?: HttpSession,
    options: HttpPostOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Cache-Control": "no-store",
    };
    if (method === "POST") headers["Content-Type"] = "application/json";
    if (session !== undefined) {
      headers.Authorization = `Bearer ${session.sessionToken}`;
      headers["X-WeChat-Device-ID"] = session.deviceId;
    } else if (options.deviceId !== undefined) {
      headers["X-WeChat-Device-ID"] = options.deviceId;
    }
    if (options.idempotencyKey !== undefined) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }
    if (options.correlationId !== undefined) {
      headers["X-Correlation-ID"] = options.correlationId;
    }

    let response: PlatformResponse<unknown>;
    try {
      response = await this.#platform.request<unknown>({
        ...(data === undefined ? {} : { data }),
        headers,
        method,
        timeoutMilliseconds: 8_000,
        url,
      });
    } catch {
      throw this.#requestError(options.errorDomain, "offline");
    }
    let responseSize: number;
    try {
      responseSize = JSON.stringify(response.data).length;
    } catch {
      throw this.#requestError(options.errorDomain, "backend_temporary");
    }
    if (responseSize > responseByteBudget) {
      throw this.#requestError(options.errorDomain, "backend_temporary");
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      const value = response.data as { code?: unknown } | null;
      const code = typeof value?.code === "string" ? value.code : "backend_temporary";
      if (options.errorDomain === "catalog_mutation") {
        throw new CatalogMutationContractError(
          knownCatalogMutationErrors.has(code as CatalogMutationErrorCode)
            ? (code as CatalogMutationErrorCode)
            : "backend_temporary",
        );
      }
      throw new AuthContractError(
        knownErrors.has(code as AuthErrorCode) ? (code as AuthErrorCode) : "backend_temporary",
      );
    }
    return response.data as T;
  }

  #requestError(
    errorDomain: HttpPostOptions["errorDomain"],
    code: "backend_temporary" | "offline",
  ): AuthContractError | CatalogMutationContractError {
    return errorDomain === "catalog_mutation"
      ? new CatalogMutationContractError(code)
      : new AuthContractError(code);
  }

  #validatePostOptions(options: HttpPostOptions): void {
    const validIdentifiers = [options.correlationId, options.idempotencyKey].every(
      (value) => value === undefined || requestIdentifierPattern.test(value),
    );
    const validDevice =
      options.deviceId === undefined ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        options.deviceId,
      );
    if (!validIdentifiers || !validDevice) {
      throw options.errorDomain === "catalog_mutation"
        ? new CatalogMutationContractError("validation_failed")
        : new AuthContractError("validation_failed");
    }
  }

  #validatePath(path: string): void {
    if (!/^\/api\/[A-Za-z0-9/_-]+$/.test(path)) {
      throw new AuthContractError("validation_failed");
    }
  }
}
