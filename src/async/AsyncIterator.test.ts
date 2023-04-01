import * as tape from "tape";
import { asyncIter } from ".";

function waitMS(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

tape("async skip", async (assert: tape.Test) => {
  assert.deepEqual(
    await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).step(2).toArray(),
    [2, 5, 8]
  );
  assert.end();
});

tape("async custom asyncIter", async (assert: tape.Test) => {
  class CustomIter<T> implements AsyncIterator<T> {
    private index = 0;
    private array: T[];

    constructor(array: T[]) {
      this.array = array;
    }

    [Symbol.iterator]() {
      return this;
    }

    async next(): Promise<IteratorResult<T, undefined>> {
      if (this.index < this.array.length) {
        await waitMS(16);
        return { done: false, value: this.array[this.index++] };
      } else {
        return { done: true, value: undefined };
      }
    }
  }

  const result = asyncIter(new CustomIter([0, 1, 2]));

  assert.deepEqual(await result.toArray(), [0, 1, 2]);

  assert.end();
});

tape("async asyncIter", async (assert: tape.Test) => {
  const result = await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .skip(1)
    .step(2)
    .map((i) => i ** 2)
    .filter((i) => i % 2 === 0)
    .toMap(
      (i) => i,
      (i) => i * 2
    )
    .toObject();

  assert.deepEqual(result, { 16: 32, 100: 200 });

  assert.end();
});

tape("async object asyncIter", async (assert: tape.Test) => {
  const result = await asyncIter({ a: 0, b: 1, c: 2 })
    .map(([k, v]) => [v, k])
    .toMap(
      ([k, _v]) => k,
      ([_k, v]) => v
    )
    .toObject();

  assert.deepEqual(result, { 0: "a", 1: "b", 2: "c" });

  assert.end();
});

tape("async Iterable asyncIter", async (assert: tape.Test) => {
  assert.deepEqual(
    await asyncIter(new Set([0, 1, 2, 3])).toArray(),
    [0, 1, 2, 3]
  );
  assert.deepEqual(
    await asyncIter(
      new Map([
        [0, 0],
        [1, 1],
      ])
    ).toArray(),
    [
      [0, 0],
      [1, 1],
    ]
  );
  assert.deepEqual(
    await asyncIter(asyncIter([0, 1, 2, 3])).toArray(),
    [0, 1, 2, 3]
  );
  assert.end();
});

tape("async native for of asyncIter", async (assert: tape.Test) => {
  const results: number[] = [];

  for await (const value of asyncIter([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]).filter((x) => x % 2 === 0)) {
    results.push(value);
  }

  assert.deepEqual(results, [0, 2, 4, 6, 8, 10]);
  assert.end();
});

tape("async string", async (assert: tape.Test) => {
  assert.deepEqual(await asyncIter("asdf").toArray(), ["a", "s", "d", "f"]);
  assert.end();
});

tape("async enumerate", async (assert: tape.Test) => {
  assert.deepEqual(await asyncIter(["a", "b", "c"]).enumerate().toArray(), [
    [0, "a"],
    [1, "b"],
    [2, "c"],
  ]);
  assert.end();
});

tape("async peekable simple", async (assert: tape.Test) => {
  const peekable = asyncIter(["a", "b", "c"]).peekable();

  assert.equal((await peekable.peek()).unwrap(), "a");
  assert.equal((await peekable.peek(1)).unwrap(), "b");
  assert.equal((await peekable.peek(2)).unwrap(), "c");
  assert.true((await peekable.peek(5)).isNone());
  assert.deepEqual(await peekable.toArray(), ["a", "b", "c"]);

  assert.end();
});

tape("async peekable", async (assert: tape.Test) => {
  const peekable = asyncIter(["a", "b", "c"]).peekable();

  assert.equal((await peekable.peek()).unwrap(), "a");
  assert.equal((await peekable.next()).value, "a");
  assert.equal((await peekable.next()).value, "b");
  assert.equal((await peekable.peek()).unwrap(), "c");
  assert.true((await peekable.peek(1)).isNone());
  assert.equal((await peekable.next()).value, "c");

  assert.end();
});

tape("async peekable unpeek", async (assert: tape.Test) => {
  const peekable = asyncIter(["a", "b", "c"]).peekable();

  assert.equal((await peekable.peek()).unwrap(), "a");
  assert.equal((await peekable.peek(1)).unwrap(), "b");
  assert.equal((await peekable.peek(2)).unwrap(), "c");
  assert.equal(peekable.unpeek().unwrap(), "a");
  assert.equal(peekable.unpeek().unwrap(), "b");
  assert.equal(peekable.unpeek().unwrap(), "c");
  assert.true(peekable.unpeek().isNone());
  assert.true((await peekable.next()).done);

  assert.end();
});

tape("async find", async (assert: tape.Test) => {
  assert.equal((await asyncIter([1, 2]).find((i) => i % 2 === 0)).unwrap(), 2);
  assert.true((await asyncIter([1, 2]).find((i) => i > 3)).isNone());
  assert.end();
});

tape("async findAll", async (assert: tape.Test) => {
  assert.deepEqual(
    await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .findAll((i) => i % 2 === 0)
      .toArray(),
    [0, 2, 4, 6, 8]
  );
  assert.end();
});

tape("async nth", async (assert: tape.Test) => {
  const result = (
    await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .map((i) => i ** 2)
      .filter((i) => i % 2 === 0)
      .nth(4)
  ).unwrap();

  assert.equal(result, 64);
  assert.end();
});

tape("async first", async (assert: tape.Test) => {
  assert.equal((await asyncIter([0, 1, 2]).first()).unwrap(), 0);
  assert.end();
});

tape("async last", async (assert: tape.Test) => {
  assert.equal((await asyncIter([0, 1, 2]).last()).unwrap(), 2);
  assert.true((await asyncIter([]).last()).isNone());
  assert.end();
});

tape("async index", async (assert: tape.Test) => {
  const result = await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .map((x, index) => index ** 2)
    .filter((x, index) => index % 2 === 0)
    .map((x, index) => index)
    .toArray();

  assert.deepEqual(result, [0, 1, 2, 3, 4]);
  assert.end();
});

tape("async forEach", async (assert: tape.Test) => {
  let count = 0;

  await asyncIter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .forEach(() => {
      count++;
    })
    .toArray();

  assert.deepEqual(count, 10);
  assert.end();
});

tape("async types", async (assert: tape.Test) => {
  const result = await asyncIter([{ key: "value" }, { key: 10 }])
    .map((obj) => obj.key)
    .filter((key) => typeof key === "string")
    .toArray();

  assert.deepEqual(result, ["value"]);
  assert.end();
});

tape("async concat", async (assert: tape.Test) => {
  const result = await asyncIter([0, 1, 2])
    .concat(asyncIter([3, 4, 5]))
    .toArray();

  assert.deepEqual(result, [0, 1, 2, 3, 4, 5]);
  assert.end();
});

tape("async consume", async (assert: tape.Test) => {
  const array: number[] = [];

  await asyncIter([0, 1, 2])
    .forEach((value) => {
      array.push(value);
    })
    .consume();

  assert.deepEqual(array, [0, 1, 2]);
  assert.end();
});

tape("async flatten defaults", async (assert: tape.Test) => {
  const array = await asyncIter([[0], [1, 2], [], [3, 4]])
    .flatten()
    .toArray();

  assert.deepEqual(array, [0, 1, 2, 3, 4]);
  assert.end();
});

tape("async flatten", async (assert: tape.Test) => {
  const values = [
    [[[0]], [1, [2]], [3, [4, [5]]], [], [[[6], [[[7, [[[8]]]]]]]]],
  ];
  const array = await asyncIter(values).flatten(9).toArray();

  assert.deepEqual(array, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.end();
});

tape("async unflatten", async (assert: tape.Test) => {
  const array = await asyncIter([0, 0, 1, 1, 2, 2])
    .unflatten(async (asyncIter) => {
      const next = await asyncIter.next();

      if (next.done) {
        return next;
      } else {
        const nextNext = await asyncIter.next();

        if (nextNext.done) {
          return nextNext;
        } else {
          return { done: false, value: [next.value, nextNext.value] };
        }
      }
    })
    .toArray();

  assert.deepEqual(array, [
    [0, 0],
    [1, 1],
    [2, 2],
  ]);
  assert.end();
});

tape("async reverse", async (assert: tape.Test) => {
  assert.deepEqual(await asyncIter([1, 2, 3]).reverse().toArray(), [3, 2, 1]);
  assert.end();
});

tape("async take", async (assert: tape.Test) => {
  assert.deepEqual(
    await asyncIter([1, 2, 3, 4, 5, 6, 7, 8, 9]).skip(5).take(5).toArray(),
    [7, 8, 9]
  );
  assert.end();
});

tape("async any/some/none/all", async (assert: tape.Test) => {
  assert.true(await asyncIter([1, 2, 3]).any((x) => x % 2 === 0));
  assert.true(await asyncIter([1, 2, 3]).some((x) => x % 2 === 1));
  assert.true(await asyncIter([1, 2, 3]).none((x) => typeof x === "object"));
  assert.true(await asyncIter([1, 2, 3]).all((x) => typeof x === "number"));
  assert.false(await asyncIter([1, 2, 3]).all((x) => typeof x !== "number"));
  assert.end();
});
