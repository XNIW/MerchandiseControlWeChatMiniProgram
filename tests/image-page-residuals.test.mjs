import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("thumbnail renewal survives page append but cannot update an unloaded page", async () => {
  for (const unload of [false, true]) {
    const { a, p } = fixture();
    p.data.products = [
      { product_id: id(2), primary_image_version_id: id(102), thumbnail_url: "old" },
    ];
    let finish;
    a.imageClient.readUrls = () =>
      new Promise((resolve) => {
        finish = resolve;
      });
    const pending = p.imageFailed({
      currentTarget: { dataset: { id: id(2), version: id(102), url: "old" } },
    });
    if (unload) p.onUnload();
    else await p.refresh(false);
    finish({
      items: [
        {
          productId: id(2),
          versionId: id(102),
          variant: "thumb",
          status: "ready",
          signedUrl: "renewed",
          expiresAt: new Date(Date.now() + 300000).toISOString(),
        },
      ],
    });
    await pending;
    assert.equal(p.data.products[0].thumbnail_url, unload ? null : "renewed");
  }
});

test("late image preparation after hide cancels instead of opening a stranded preview", async () => {
  const { a, p } = fixture("product-detail");
  p.onLoad({ id: id(2) });
  p.data.canManageImages = true;
  let complete, decision;
  const {
    ProductImageMutationError,
  } = require("../dist-test/miniprogram/lib/product-image-mutation-client.js");
  a.imageClient.selectAndReplace = async (_s, _p, _source, preview) => {
    await new Promise((r) => {
      complete = r;
    });
    decision = await preview({ mainPath: "main", thumbPath: "thumb" });
    throw new ProductImageMutationError("image_operation_cancelled");
  };
  const pending = p.replaceImage({ currentTarget: { dataset: { source: "album" } } });
  p.onHide();
  complete();
  await new Promise((r) => setImmediate(r));
  assert.equal(p.data.imagePreviewUrl, "");
  assert.equal(decision, false);
  await pending;
  assert.equal(p.data.imageBusy, false);
});

test("new shop context releases busy state after cancelling old preview", async () => {
  const { a, p } = fixture("product-detail");
  p.onLoad({ id: id(2) });
  p.data.canManageImages = true;
  p.context = `1:${id(1)}:${id(2)}`;
  const {
    ProductImageMutationError,
  } = require("../dist-test/miniprogram/lib/product-image-mutation-client.js");
  a.imageClient.selectAndReplace = async (_s, _p, _source, preview) => {
    await preview({ mainPath: "main", thumbPath: "thumb" });
    throw new ProductImageMutationError("image_operation_cancelled");
  };
  const pending = p.replaceImage({ currentTarget: { dataset: { source: "album" } } });
  a.activeShop = { shop_id: id(3) };
  a.salesClient.productDetail = async () => null;
  await p.load();
  await pending;
  assert.equal(p.data.imageBusy, false);
  assert.equal(p.data.imagePreviewUrl, "");
});
function fixture(name = "database") {
  let definition;
  const a = {
    locale: "en",
    featureReady: true,
    activeShop: { shop_id: id(1), can_read_catalog: true, can_manage_images: true },
    sessionStore: {
      generation: 1,
      load: () => ({ accountFingerprint: "a".repeat(64) }),
      subscribe() {},
    },
    sensitiveCaches: { generation: 1, register() {} },
    salesClient: { catalogPage: async () => [] },
    imageClient: {
      readUrls: async (_shop, refs) => ({
        items: refs.map((ref) => ({
          ...ref,
          status: "ready",
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
          signedUrl: `https://image.example.test/${ref.productId}`,
        })),
      }),
    },
  };
  globalThis.getApp = () => a;
  globalThis.Page = (p) => {
    definition = p;
  };
  globalThis.wx = { setNavigationBarTitle() {} };
  const file = require.resolve(`../dist-test/miniprogram/pages/${name}/index.js`);
  delete require.cache[file];
  require(file);
  const p = { ...definition, data: structuredClone(definition.data) };
  p.setData = (d) => Object.assign(p.data, d);
  return { a, p };
}
test("all 50 page thumbnails survive a smaller reusable URL cache", async () => {
  const { a, p } = fixture();
  a.salesClient.catalogPage = async () =>
    Array.from({ length: 50 }, (_, i) => ({
      product_id: id(i + 2),
      primary_image_version_id: id(i + 102),
      updated_at: "2026-09-25T12:00:00Z",
      retail_price: 1,
    }));
  await p.refresh(true);
  assert.equal(p.data.products.filter((r) => r.thumbnail_url).length, 50);
});
test("thumbnail error renews once and ignores a response after shop switch", async () => {
  const { a, p } = fixture();
  const row = { product_id: id(2), primary_image_version_id: id(102), thumbnail_url: "old" };
  p.data.products = [row];
  let calls = 0;
  a.imageClient.readUrls = async () => {
    calls++;
    return {
      items: [
        {
          productId: id(2),
          versionId: id(102),
          variant: "thumb",
          status: "ready",
          signedUrl: "renewed",
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
        },
      ],
    };
  };
  await p.imageFailed({ currentTarget: { dataset: { id: id(2), version: id(102), url: "old" } } });
  assert.equal(p.data.products[0].thumbnail_url, "renewed");
  await p.imageFailed({
    currentTarget: { dataset: { id: id(2), version: id(102), url: "renewed" } },
  });
  assert.equal(calls, 1);
  assert.equal(p.data.products[0].thumbnail_url, null);
  const other = fixture();
  other.p.data.products = [row];
  let resolve;
  other.a.imageClient.readUrls = () =>
    new Promise((r) => {
      resolve = r;
    });
  const pending = other.p.imageFailed({
    currentTarget: { dataset: { id: id(2), version: id(102), url: "old" } },
  });
  other.a.activeShop = { shop_id: id(3) };
  resolve({
    items: [
      {
        productId: id(2),
        versionId: id(102),
        variant: "thumb",
        status: "ready",
        signedUrl: "late",
      },
    ],
  });
  await pending;
  assert.notEqual(other.p.data.products[0].thumbnail_url, "late");
});
test("detail renews an expired image once and ignores old-version callbacks", async () => {
  const { a, p } = fixture("product-detail");
  p.onLoad({ id: id(2) });
  p.data.product = { product_id: id(2), primary_image_version_id: id(102) };
  p.data.imageUrl = "old";
  let calls = 0;
  a.imageClient.readUrls = async () => {
    calls++;
    return {
      items: [
        {
          productId: id(2),
          versionId: id(102),
          variant: "main",
          status: "ready",
          signedUrl: "renewed",
        },
      ],
    };
  };
  await p.imageFailed({ currentTarget: { dataset: { version: id(102), url: "old" } } });
  assert.equal(p.data.imageUrl, "renewed");
  await p.imageFailed({ currentTarget: { dataset: { version: id(101), url: "renewed" } } });
  assert.equal(calls, 1);
  assert.equal(p.data.imageUrl, "renewed");
  await p.imageFailed({ currentTarget: { dataset: { version: id(102), url: "renewed" } } });
  assert.equal(calls, 1);
  assert.equal(p.data.imageUrl, "");
});
test("image preview requires explicit confirmation and cancels on page departure", async () => {
  const { a, p } = fixture("product-detail");
  p.onLoad({ id: id(2) });
  p.data.canManageImages = true;
  let confirmed;
  const {
    ProductImageMutationError,
  } = require("../dist-test/miniprogram/lib/product-image-mutation-client.js");
  a.imageClient.selectAndReplace = async (_shop, _product, _source, preview) => {
    confirmed = await preview({ mainPath: "/local/main.jpg", thumbPath: "/local/thumb.jpg" });
    throw new ProductImageMutationError("image_operation_cancelled");
  };
  const pending = p.replaceImage({ currentTarget: { dataset: { source: "camera" } } });
  assert.equal(p.data.imagePreviewUrl, "/local/main.jpg");
  assert.equal(confirmed, undefined);
  p.onHide();
  await pending;
  assert.equal(confirmed, false);
  assert.equal(p.data.imagePreviewUrl, "");
  assert.equal(p.data.imageBusy, false);
});
