declare module "node:test" {
  type TestCallback = () => void | Promise<void>;
  export default function test(name: string, callback: TestCallback): void;
}

declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}
