import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { HttpClient } from "../../lib/http-client";
import { MiniPairingClient, miniDirectProtocol } from "../../lib/mini-direct";
import { createWeChatPlatform } from "../../lib/platform";

const app = getApp<MerchandiseControlApp>();
const messages = {
  en: {
    title: "Link personal account",
    instruction:
      "Sign in to your Admin account, open WeChat Mini in Account profile and start linking. Enter its transfer code here.",
    code: "Transfer code",
    claim: "Verify my WeChat identity",
    compare:
      "Check the account and comparison number in Admin. Approve there first, then confirm here.",
    consent: "This is my account and the same comparison number appears in Admin.",
    confirm: "Confirm with a fresh WeChat login",
    linked: "Linked. Return to Home to sign in when pilot login is enabled.",
    error:
      "Linking did not finish. Check the Admin approval and expiry; restart the pairing if needed.",
    disabled: "Mini enrollment is not enabled.",
    back: "Back",
  },
  it: {
    title: "Collega account personale",
    instruction:
      "Accedi al tuo account Admin, apri WeChat Mini nel Profilo account e avvia il collegamento. Inserisci qui il codice di trasferimento.",
    code: "Codice di trasferimento",
    claim: "Verifica la mia identità WeChat",
    compare:
      "Controlla account e numero di confronto in Admin. Approva prima lì, poi conferma qui.",
    consent: "Questo è il mio account e lo stesso numero di confronto appare in Admin.",
    confirm: "Conferma con un nuovo login WeChat",
    linked: "Collegato. Torna a Home per accedere quando il login pilot sarà abilitato.",
    error:
      "Collegamento non concluso. Controlla approvazione Admin e scadenza; riavvia il pairing se necessario.",
    disabled: "Enrollment Mini non abilitato.",
    back: "Indietro",
  },
  es: {
    title: "Vincular cuenta personal",
    instruction:
      "Inicia sesión en Admin, abre WeChat Mini en Perfil de cuenta e inicia el vínculo. Introduce aquí el código de transferencia.",
    code: "Código de transferencia",
    claim: "Verificar mi identidad WeChat",
    compare:
      "Comprueba la cuenta y el número en Admin. Aprueba allí primero y después confirma aquí.",
    consent: "Esta es mi cuenta y el mismo número aparece en Admin.",
    confirm: "Confirmar con un nuevo inicio WeChat",
    linked: "Vinculado. Vuelve a Inicio para acceder cuando se habilite el piloto.",
    error:
      "No se completó el vínculo. Comprueba la aprobación Admin y la caducidad; reinicia si es necesario.",
    disabled: "Vinculación Mini no habilitada.",
    back: "Volver",
  },
  "zh-Hans": {
    title: "关联个人账户",
    instruction:
      "登录自己的 Admin 账户，在账户资料中打开 WeChat Mini 并开始关联。将转移代码输入此处。",
    code: "转移代码",
    claim: "验证我的微信身份",
    compare: "请在 Admin 核对账户和比较数字。先在那里批准，再回到此处确认。",
    consent: "这是我的账户，且 Admin 显示相同的比较数字。",
    confirm: "重新微信登录并确认",
    linked: "已关联。试点登录启用后可返回首页登录。",
    error: "关联未完成。请检查 Admin 批准状态和有效期，必要时重新开始。",
    disabled: "小程序关联尚未启用。",
    back: "返回",
  },
};
const ready =
  runtimeConfig.miniEnrollmentEnabled === true &&
  runtimeConfig.miniAuthProtocol === miniDirectProtocol &&
  /^https:\/\/[A-Za-z0-9.-]+$/.test(runtimeConfig.gatewayBaseUrl);
let pairing: MiniPairingClient | null = null;
let transferCode = "";
let pageGeneration = 0;
Page({
  data: {
    text: messages[app.locale],
    ready,
    busy: false,
    claimed: false,
    consent: false,
    comparison: "",
    accountName: "",
    linked: false,
    error: false,
  },
  onLoad() {
    pageGeneration += 1;
    const platform = createWeChatPlatform();
    pairing = ready
      ? new MiniPairingClient(new HttpClient(runtimeConfig.gatewayBaseUrl, platform), platform)
      : null;
    this.setData({ text: messages[app.locale] });
    wx.setNavigationBarTitle({ title: messages[app.locale].title });
  },
  onUnload() {
    pageGeneration += 1;
    pairing?.cancel();
    pairing = null;
    transferCode = "";
  },
  enterCode(event: WechatMiniprogram.Input) {
    transferCode = event.detail.value.trim();
  },
  changeConsent(event: WechatMiniprogram.CheckboxGroupChange) {
    this.setData({ consent: event.detail.value.includes("confirm") });
  },
  async claim() {
    if (!pairing || this.data.busy) return;
    const generation = pageGeneration;
    this.setData({ busy: true, error: false });
    try {
      const context = await pairing.claim(transferCode);
      if (generation !== pageGeneration) return;
      transferCode = "";
      // Only display context reaches setData; capabilities remain in memory.
      this.setData({
        claimed: true,
        comparison: context.comparison,
        accountName: context.accountName,
      });
    } catch {
      if (generation === pageGeneration) this.setData({ error: true });
    } finally {
      if (generation === pageGeneration) this.setData({ busy: false });
    }
  },
  async confirm() {
    if (!pairing || this.data.busy || !this.data.consent) return;
    const generation = pageGeneration;
    this.setData({ busy: true, error: false });
    try {
      await pairing.confirm();
      if (generation === pageGeneration)
        this.setData({ linked: true, claimed: false, comparison: "", accountName: "" });
    } catch {
      if (generation === pageGeneration) this.setData({ error: true });
    } finally {
      if (generation === pageGeneration) this.setData({ busy: false });
    }
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/account/index" }) });
  },
});
