import type { MerchandiseControlApp } from "../../app";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import type { SaleDetail } from "../../lib/contracts";
import { translationsFor } from "../../locales/index";
import { readErrorTranslationKey } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

Page({
  data: {
    grossText: "",
    discountText: "",
    netText: "",
    lines: [] as readonly {
      line_position: number;
      product_name: string | null;
      barcode: string | null;
      quantityText: string;
      unitText: string;
      amountText: string;
    }[],
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
    const generation = app.sessionStore.generation;
    const current = () =>
      app.activeShop?.shop_id === shop.shop_id && app.sessionStore.generation === generation;
    try {
      const detail = await app.salesClient.saleDetail(shop.shop_id, id);
      if (!current()) return;
      this.setData({
        detail,
        loading: false,
        grossText: formatCatalogNumber(detail?.sale.gross_amount_clp),
        discountText: formatCatalogNumber(detail?.sale.discount_amount_clp),
        netText: formatCatalogNumber(detail?.sale.net_amount_clp),
        lines:
          detail?.lines.map((l) => ({
            ...l,
            quantityText: formatCatalogNumber(l.quantity),
            unitText: formatCatalogNumber(l.unit_amount_clp),
            amountText: formatCatalogNumber(l.line_amount_clp),
          })) ?? [],
      });
    } catch (error) {
      if (current())
        this.setData({
          errorMessage: this.data.text[readErrorTranslationKey(error)],
          loading: false,
        });
    }
  },
});
