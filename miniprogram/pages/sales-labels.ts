import type { TranslationKey } from "../locales/index";

const keys: Readonly<
  Record<"kind" | "status" | "payment", Readonly<Record<string, TranslationKey>>>
> = {
  kind: { sale: "saleKindSale", refund: "saleKindRefund", void: "saleKindVoid" },
  status: {
    accepted: "saleStatusAccepted",
    duplicate: "saleStatusDuplicate",
    conflict: "saleStatusConflict",
    rejected: "saleStatusRejected",
  },
  payment: {
    cash: "paymentCash",
    card: "paymentCard",
    transfer: "paymentTransfer",
    other: "paymentOther",
  },
};

export function salesCodeLabel(
  code: string,
  domain: keyof typeof keys,
  text: Readonly<Record<TranslationKey, string>>,
): string {
  if (!code) return text.all;
  const key = Object.hasOwn(keys[domain], code) ? keys[domain][code] : undefined;
  return key ? text[key] : code;
}
