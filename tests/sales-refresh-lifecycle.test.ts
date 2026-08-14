import test from "node:test";
import type { AuthorizedShop } from "../miniprogram/lib/contracts";
import { assert, assertEqual } from "./fakes";

interface RegisteredPage {
  data: Record<string, unknown>;
  [key: string]: unknown;
}

function instantiatePage(definition: RegisteredPage): RegisteredPage {
  const page: RegisteredPage = { ...definition, data: { ...definition.data } };
  page.setData = (update: Record<string, unknown>) => Object.assign(page.data, update);
  return page;
}

function invoke(page: RegisteredPage, methodName: string): unknown {
  const method = page[methodName];
  assert(typeof method === "function", `${methodName} is registered`);
  return method.apply(page);
}

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

test("sales page runs bounded refresh only while visible", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousGetApp = globals.getApp;
  const previousPage = globals.Page;
  const previousWx = globals.wx;
  let registeredPage: RegisteredPage | null = null;
  let page: RegisteredPage | null = null;
  const shop: AuthorizedShop = {
    can_change_prices: true,
    can_manage_images: true,
    can_read_catalog: true,
    can_read_catalog_history: true,
    can_write_categories: true,
    can_write_products: true,
    can_write_suppliers: true,
    currency_code: "CLP",
    role_key: "shop_owner",
    server_time: "2026-08-14T00:00:00Z",
    shop_code: "STAGING",
    shop_id: "10000000-0000-4000-8000-000000000401",
    shop_name: "Staging",
    time_zone: "America/Santiago",
  };
  const app = {
    activeShop: shop,
    clearSessionContext() {},
    locale: "en",
    salesClient: {
      async periodSummary() {
        return [];
      },
      async salesFilterOptions() {
        return {
          can_filter_operational_metadata: true,
          devices: [],
          payment_methods: [],
          staff: [],
        };
      },
      async salesPage() {
        return [];
      },
    },
    sensitiveCaches: {
      generation: 1,
      register() {},
    },
    sessionStore: {
      load() {
        return {
          accountFingerprint: "a".repeat(64),
          deviceId: "00000000-0000-4000-8000-000000000901",
          expiresAt: 4_600,
          sessionToken: "b".repeat(43),
        };
      },
    },
  };
  globals.getApp = () => app;
  globals.Page = (definition: unknown) => {
    assert(typeof definition === "object" && definition !== null, "Page definition is an object");
    registeredPage = definition as RegisteredPage;
  };
  globals.wx = {
    navigateTo() {},
    stopPullDownRefresh() {},
  };

  try {
    await import("../miniprogram/pages/sales/index.js");
    assert(registeredPage !== null, "sales page was registered");
    page = instantiatePage(registeredPage);

    invoke(page, "onShow");
    await settle();
    assert(page.refreshController !== undefined, "visible page starts automatic refresh");
    assertEqual(page.data.loading, false, "initial refresh settles before polling");

    invoke(page, "onHide");
    assertEqual(page.refreshController, undefined, "hidden page stops automatic refresh");

    invoke(page, "onShow");
    await settle();
    assert(page.refreshController !== undefined, "returning to the page restarts refresh");
    invoke(page, "onUnload");
    assertEqual(page.refreshController, undefined, "unload clears automatic refresh");
  } finally {
    if (page?.refreshController !== undefined) invoke(page, "onUnload");
    if (previousGetApp === undefined) delete globals.getApp;
    else globals.getApp = previousGetApp;
    if (previousPage === undefined) delete globals.Page;
    else globals.Page = previousPage;
    if (previousWx === undefined) delete globals.wx;
    else globals.wx = previousWx;
  }
});
