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

function square(x: number) {
  return x * x;
}

function isEven(x: number) {
  return x % 2 === 0;
}

tape("iter map/filter", (assert: tape.Test) => {
  new Suite()
    .add("iter", () => {
      for (const _ of iter(BIG_ARRAY).map(square).filter(isEven)) {
      }
    })
    .add("native", () => {
      for (const _ of BIG_ARRAY.map(square).filter(isEven)) {
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

tape("iter merge/concat", (assert: tape.Test) => {
  new Suite()
    .add("iter", () => {
      for (const _ of iter(BIG_ARRAY.map(square).filter(isEven)).merge(
        iter(BIG_ARRAY.map(square).filter(isEven))
      )) {
      }
    })
    .add("native", () => {
      for (const _ of BIG_ARRAY.map(square)
        .filter(isEven)
        .concat(BIG_ARRAY.map(square).filter(isEven))) {
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
    yield Promise.resolve(square(x));
  }
}

async function* nativeFilter(array: number[]) {
  for (const x of array) {
    if (await Promise.resolve(isEven(x))) {
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
          .map(square)
          .filter(isEven)) {
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
