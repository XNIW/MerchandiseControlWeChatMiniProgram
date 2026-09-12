import { readFileSync } from "node:fs";
import test from "node:test";
import { assert, assertEqual } from "./fakes";

test("Account exposes one privacy action outside all conditional account gates", () => {
  const template = readFileSync("miniprogram/pages/account/index.wxml", "utf8");
  const ancestors: string[] = [];
  let actions = 0;
  for (const tag of template.matchAll(/<(\/?)([\w-]+)\b([^>]*?)>/g)) {
    if (tag[1]) {
      ancestors.pop();
      continue;
    }
    const attributes = tag[3] ?? "";
    if (attributes.includes('bindtap="openPrivacy"')) {
      actions += 1;
      assert(
        [...ancestors, attributes].every((value) => !/wx:(?:if|elif|else)\b/.test(value)),
        "privacy must remain visible when Auth is OFF, loading or signed out",
      );
    }
    if (!attributes.endsWith("/")) ancestors.push(attributes);
  }
  assertEqual(actions, 1, "privacy action is present once");
});
