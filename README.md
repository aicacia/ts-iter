# ts-iter

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.github.io/ts-iter/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/iter)](https://www.npmjs.com/package/@aicacia/iter)
[![build](https://github.com/aicacia/ts-iter/workflows/Test/badge.svg)](https://github.com/aicacia/ts-iter/actions?query=workflow%3ATest)

aicacia iter

```ts
import { iter } from "@aicacia/iter";

const evens = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map((x) => x * x)
  .filter((x) => x % 2 === 0);

for (const value of evens) {
  console.log(value);
}
```
