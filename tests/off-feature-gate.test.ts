import test from "node:test";
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

test("disabled runtime gates every non-home tab before session or network work", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousGetApp = globals.getApp;
  const previousPage = globals.Page;
  const previousWx = globals.wx;
  const registeredPages: RegisteredPage[] = [];
  let sessionReads = 0;
  let stoppedPullDownRefreshes = 0;
  const app = {
    activeShop: null,
    featureReady: false,
    locale: "en",
    salesClient: null,
    sensitiveCaches: {
      generation: 0,
      register() {},
    },
    sessionStore: {
      generation: 0,
      load() {
        sessionReads += 1;
        return null;
      },
    },
  };
  globals.getApp = () => app;
  globals.Page = (definition: unknown) => {
    assert(typeof definition === "object" && definition !== null, "Page definition is an object");
    registeredPages.push(instantiatePage(definition as RegisteredPage));
  };
  globals.wx = {
    setNavigationBarTitle() {},
    stopPullDownRefresh() {
      stoppedPullDownRefreshes += 1;
    },
  };

  try {
    await import("../miniprogram/pages/sales/index.js");
    await import("../miniprogram/pages/database/index.js");
    await import("../miniprogram/pages/history/index.js");
    await import("../miniprogram/pages/account/index.js");
    assertEqual(registeredPages.length, 4, "all non-home tabs register");

    for (const page of registeredPages) {
      assertEqual(page.data.featureReady, false, "disabled runtime is visible to the template");
      invoke(page, "onShow");
    }
    assertEqual(sessionReads, 0, "onShow performs no session or request preparation");

    for (const page of registeredPages.slice(0, 3)) invoke(page, "onPullDownRefresh");
    assertEqual(sessionReads, 0, "pull-to-refresh stays behind the disabled gate");
    assertEqual(stoppedPullDownRefreshes, 3, "disabled pull-to-refresh settles immediately");
  } finally {
    if (previousGetApp === undefined) delete globals.getApp;
    else globals.getApp = previousGetApp;
    if (previousPage === undefined) delete globals.Page;
    else globals.Page = previousPage;
    if (previousWx === undefined) delete globals.wx;
    else globals.wx = previousWx;
  }
});
