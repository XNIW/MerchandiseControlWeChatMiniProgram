import type { MerchandiseControlApp } from "../../app";
import type { SaleDetail } from "../../lib/contracts";
import { translationsFor } from "../../locales/index";

const app = getApp<MerchandiseControlApp>();

Page({
  data: {
    detail: null as SaleDetail | null,
    errorMessage: "",
    loading: true,
    text: translationsFor(app.locale),
  },
  async onLoad(options: Record<string, string | undefined>) {
    const id = options.id;
    const shop = app.activeShop;
    if (!id || !shop || !app.salesClient) {
      this.setData({ errorMessage: this.data.text.error, loading: false });
      return;
    }
    try {
      this.setData({ detail: await app.salesClient.saleDetail(shop.shop_id, id), loading: false });
    } catch {
      this.setData({ errorMessage: this.data.text.offline, loading: false });
    }
  },
});
