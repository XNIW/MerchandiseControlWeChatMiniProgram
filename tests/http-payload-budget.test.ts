import test from "node:test";
import { HttpClient, utf8ByteLength } from "../miniprogram/lib/http-client";
import { assertEqual, expectReject, FakePlatform } from "./fakes";

test("HTTP envelope accepts exactly 128 KiB and rejects one byte over, including Unicode", async () => {
  const platform = new FakePlatform();
  const client = new HttpClient("https://admin.example.test", platform);
  const session = {
    deviceId: "00000000-0000-4000-8000-000000000009",
    sessionToken: "x".repeat(43),
  };
  assertEqual(utf8ByteLength("中😀a"), 8, "UTF-8, not UTF-16 code units");
  for (const text of ["a".repeat(131_070), "中".repeat(43_690)]) {
    assertEqual(utf8ByteLength(JSON.stringify(text)), 131_072, "exact boundary");
    platform.queuedResponses.push({ statusCode: 200, data: text });
    await client.get("/api/test", {}, session);
    platform.queuedResponses.push({ statusCode: 200, data: `${text}a` });
    await expectReject(
      () => client.get("/api/test", {}, session),
      () => true,
    );
  }
});
