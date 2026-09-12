import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { policyBundle, policyContentSha256 } from "../../content/policies";
import type { LocaleKey } from "../../locales/index";

const app = getApp<MerchandiseControlApp>();
const locales: readonly LocaleKey[] = ["zh-Hans", "en", "es", "it"];

export function policyView(locale: LocaleKey, kind: "privacy" | "deletion") {
  const text = policyBundle.locales[locale];
  return {
    contentVersion: policyBundle.contentVersion,
    document: text[kind],
    kind,
    localeIndex: Math.max(0, locales.indexOf(locale)),
    text,
  };
}

Page({
  data: {
    ...policyView(app.locale, "privacy"),
    canCopyProfile: /^https:\/\/[A-Za-z0-9.-]+$/.test(runtimeConfig.gatewayBaseUrl),
    localeLabels: ["简体中文", "English", "Español", "Italiano"],
    policyContentSha256,
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData(policyView(app.locale, options.kind === "deletion" ? "deletion" : "privacy"));
    wx.setNavigationBarTitle({ title: this.data.document.title });
  },
  onShow() {
    this.setData(policyView(app.locale, this.data.kind));
    wx.setNavigationBarTitle({ title: this.data.document.title });
  },
  chooseLocale(event: WechatMiniprogram.PickerChange) {
    const locale = locales[Number(event.detail.value)];
    if (!locale) return;
    app.setLocale(locale);
    this.setData(policyView(locale, this.data.kind));
    wx.setNavigationBarTitle({ title: this.data.document.title });
  },
  showOtherDocument() {
    this.setData(policyView(app.locale, this.data.kind === "privacy" ? "deletion" : "privacy"));
    wx.setNavigationBarTitle({ title: this.data.document.title });
    wx.pageScrollTo({ duration: 0, scrollTop: 0 });
  },
  copyProfileLink() {
    if (!this.data.canCopyProfile) return;
    wx.setClipboardData({ data: `${runtimeConfig.gatewayBaseUrl}/account/profile` });
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/account/index" }) });
  },
});
