export interface RuntimeConfig {
  readonly autoRefreshMilliseconds: number;
  readonly autoRefreshMaximumMilliseconds: number;
  readonly gatewayBaseUrl: string;
  readonly privacyUrl: string;
  readonly supabaseStorageBaseUrl: string;
  readonly weChatAuthEnabled: boolean;
}

// Public client configuration only. Activation requires a reviewed change after
// the request-domain/AppID checklist is complete. AppSecret never belongs here.
export const runtimeConfig: RuntimeConfig = Object.freeze({
  autoRefreshMaximumMilliseconds: 30_000,
  autoRefreshMilliseconds: 3_000,
  gatewayBaseUrl: "",
  privacyUrl: "https://example.invalid/privacy",
  supabaseStorageBaseUrl: "",
  weChatAuthEnabled: false,
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
