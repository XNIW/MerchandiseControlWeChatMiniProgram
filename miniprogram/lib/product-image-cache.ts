import type { ProductImageUrl } from "./contracts";
import { SessionBoundedCache } from "./sensitive-cache";
import type { SessionStore } from "./session-store";

const defaultExpirySafetyWindowMilliseconds = 30_000;

export interface ProductImageReference {
  readonly productId: string;
  readonly shopId: string;
  readonly variant: "main" | "thumb";
  readonly versionId: string;
}

interface ScopedProductImage {
  readonly image: ProductImageUrl;
  readonly shopId: string;
}

export class ProductImageCache {
  readonly #cache: SessionBoundedCache<ScopedProductImage>;
  readonly #expirySafetyWindowMilliseconds: number;
  readonly #nowMilliseconds: () => number;

  constructor(
    maximumEntries: number,
    sessions: SessionStore,
    nowMilliseconds = () => Date.now(),
    expirySafetyWindowMilliseconds = defaultExpirySafetyWindowMilliseconds,
  ) {
    if (expirySafetyWindowMilliseconds < 0) throw new Error("invalid_expiry_safety_window");
    this.#cache = new SessionBoundedCache(maximumEntries, sessions);
    this.#expirySafetyWindowMilliseconds = expirySafetyWindowMilliseconds;
    this.#nowMilliseconds = nowMilliseconds;
  }

  get(reference: ProductImageReference): ProductImageUrl | undefined {
    const key = this.#key(reference);
    const scoped = this.#cache.get(key);
    if (
      scoped === undefined ||
      scoped.shopId !== reference.shopId ||
      scoped.image.productId !== reference.productId ||
      scoped.image.variant !== reference.variant ||
      scoped.image.versionId !== reference.versionId ||
      !this.#isUsable(scoped.image)
    ) {
      this.#cache.delete(key);
      return undefined;
    }
    return scoped.image;
  }

  set(shopId: string, image: ProductImageUrl): void {
    const reference: ProductImageReference = {
      productId: image.productId,
      shopId,
      variant: image.variant,
      versionId: image.versionId,
    };
    const key = this.#key(reference);
    if (!this.#isUsable(image)) {
      this.#cache.delete(key);
      return;
    }
    this.#cache.set(key, { image, shopId });
  }

  clear(): void {
    this.#cache.clear();
  }

  #isUsable(image: ProductImageUrl): boolean {
    const expiresAt = Date.parse(image.expiresAt);
    return (
      Number.isFinite(expiresAt) &&
      expiresAt - this.#expirySafetyWindowMilliseconds > this.#nowMilliseconds()
    );
  }

  #key(reference: ProductImageReference): string {
    return [reference.shopId, reference.productId, reference.versionId, reference.variant].join(
      ":",
    );
  }
}
