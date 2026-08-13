declare module "node:test" {
  type TestCallback = () => void | Promise<void>;
  export default function test(name: string, callback: TestCallback): void;
}
