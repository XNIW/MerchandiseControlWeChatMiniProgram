export interface RuntimeConfig {
  readonly autoRefreshMilliseconds: number;
  readonly autoRefreshMaximumMilliseconds: number;
  readonly gatewayBaseUrl: string;
  readonly privacyUrl: string;
  readonly supabaseStorageBaseUrl: string;
  readonly weChatAuthEnabled: boolean;
}

function injectedPublicValue(value: string, fallback: string): string {
  return value.startsWith("__MC_WECHAT_") ? fallback : value;
}

// Public client configuration only. scripts/build.mjs replaces these markers
// from the approved build environment and leaves safe OFF defaults when absent.
// AppID stays in ignored DevTools configuration. AppSecret never belongs here.
export const runtimeConfig: RuntimeConfig = Object.freeze({
  autoRefreshMaximumMilliseconds: 30_000,
  autoRefreshMilliseconds: 3_000,
  gatewayBaseUrl: injectedPublicValue("__MC_WECHAT_GATEWAY_BASE_URL__", ""),
  privacyUrl: injectedPublicValue("__MC_WECHAT_PRIVACY_URL__", "https://example.invalid/privacy"),
  supabaseStorageBaseUrl: injectedPublicValue("__MC_WECHAT_STORAGE_BASE_URL__", ""),
  weChatAuthEnabled: injectedPublicValue("__MC_WECHAT_AUTH_ENABLED__", "0") === "1",
});

export function isRuntimeConfigReady(config: RuntimeConfig): boolean {
  if (!config.weChatAuthEnabled) return false;
  if (
    !Number.isInteger(config.autoRefreshMilliseconds) ||
    config.autoRefreshMilliseconds < 3_000 ||
    config.autoRefreshMilliseconds > config.autoRefreshMaximumMilliseconds ||
    config.autoRefreshMaximumMilliseconds > 60_000
  ) {
    return false;
  }
  const publicHttpsOrigin = /^https:\/\/[A-Za-z0-9.-]+(?::[1-9][0-9]{0,4})?\/?$/;
  return publicHttpsOrigin.test(config.gatewayBaseUrl);
}

export function isProductImageRuntimeConfigReady(config: RuntimeConfig): boolean {
  return (
    isRuntimeConfigReady(config) &&
    /^https:\/\/[A-Za-z0-9.-]+(?::[1-9][0-9]{0,4})?\/?$/.test(config.supabaseStorageBaseUrl)
  );
}
