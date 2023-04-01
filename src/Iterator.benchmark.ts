import * as tape from "tape";
import { Suite, Event } from "benchmark";
import { asyncIter } from "./async";
import { iter } from ".";

const SIZE = 1_000_000;

function createArray(size: number) {
  return Array.from(Array(size), (_, index) => index + 1);
}

const BIG_ARRAY = createArray(SIZE);
const SMALL_ARRAY = createArray((SIZE / 4) | 0);

tape("iter", (assert: tape.Test) => {
  new Suite()
    .add("iter", () => {
      for (const _ of iter(BIG_ARRAY)
        .map((x) => x * x)
        .filter((x) => x % 2 === 0)) {
      }
    })
    .add("native", () => {
      for (const _ of BIG_ARRAY.map((x) => x * x).filter((x) => x % 2 === 0)) {
      }
    })
    .on("cycle", function (this: Suite, event: Event) {
      console.log(String(event.target));
    })
    .on("complete", function () {
      assert.end();
    })
    .run({ async: true });
});

async function* nativeSquare(array: number[]) {
  for (const x of array) {
    yield Promise.resolve(x * x);
  }
}

async function* nativeFilter(array: number[]) {
  for (const x of array) {
    if (await Promise.resolve(x % 2 === 0)) {
      yield x;
    }
  }
}

tape("asyncIter", (assert: tape.Test) => {
  new Suite()
    .add(
      "asyncIter",
      async (deferred: typeof Promise) => {
        for await (const _ of asyncIter(SMALL_ARRAY)
          .map((x) => x * x)
          .filter((x) => x % 2 === 0)) {
        }
        deferred.resolve();
      },
      {
        defer: true,
      }
    )
    .add(
      "async native",
      async (deferred: typeof Promise) => {
        const squares: number[] = [];
        for await (const x of nativeSquare(SMALL_ARRAY)) {
          squares.push(x);
        }
        for await (const _ of nativeFilter(squares)) {
        }
        deferred.resolve();
      },
      {
        defer: true,
      }
    )
    .on("cycle", function (this: Suite, event: Event) {
      console.log(String(event.target));
    })
    .on("complete", function () {
      assert.end();
    })
    .run({ async: true });
});
