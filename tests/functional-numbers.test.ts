import test from "node:test";
import { validateProductForm } from "../miniprogram/pages/catalog-management";
import { assertEqual } from "./fakes";

const form = {
  barcode: "CLP-1",
  categoryId: "",
  itemNumber: "",
  productName: "CLP",
  purchasePrice: "",
  retailPrice: "",
  secondProductName: "",
  stockQuantity: "",
  supplierId: "",
};
test("F01 Chilean CLP and quantities have distinct unambiguous parsing", () => {
  for (const [input, expected] of [
    ["47100", 47100],
    ["47.100", 47100],
    ["0", 0],
    ["999.999.999.999", 999999999999],
  ] as const) {
    const result = validateProductForm({ ...form, retailPrice: input });
    assertEqual(result.ok, true, input);
    if (result.ok) assertEqual(result.payload.retailPrice, expected, input);
  }
  for (const [input, expected] of [
    ["1,250", 1.25],
    ["1.234,567", 1234.567],
    ["1.000.000.000.000", 1e12],
    ["0", 0],
  ] as const) {
    const result = validateProductForm({ ...form, stockQuantity: input });
    assertEqual(result.ok, true, input);
    if (result.ok) assertEqual(result.payload.stockQuantity, expected, input);
  }
  const empty = validateProductForm(form);
  if (empty.ok) {
    assertEqual(empty.payload.retailPrice, undefined, "empty price omitted");
    assertEqual(empty.payload.stockQuantity, null, "empty quantity null");
  }
  for (const input of ["1,250", "47.10", "1e3", "-1", " 1", "1.000.000.000.000", "1,00"]) {
    assertEqual(validateProductForm({ ...form, retailPrice: input }).ok, false, input);
  }
  for (const input of ["1,2345", "1.23,45", "1.000.000.000.001", "NaN"]) {
    assertEqual(validateProductForm({ ...form, stockQuantity: input }).ok, false, input);
  }
});
