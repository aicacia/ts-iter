import * as tape from "tape";
import { iter } from ".";

tape("skip", (assert: tape.Test) => {
  assert.deepEqual(
    iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).step(2).toArray(),
    [2, 5, 8]
  );
  assert.end();
});

tape("custom iter", (assert: tape.Test) => {
  class CustomIter<T> implements Iterator<T> {
    private index = 0;
    private array: T[];

    constructor(array: T[]) {
      this.array = array;
    }

    [Symbol.iterator]() {
      return this;
    }

    next(): IteratorResult<T, undefined> {
      if (this.index < this.array.length) {
        return { done: false, value: this.array[this.index++] };
      } else {
        return { done: true, value: undefined };
      }
    }
  }

  const result = iter(new CustomIter([0, 1, 2]));

  assert.deepEqual(result.toArray(), [0, 1, 2]);

  assert.end();
});

tape("iter", (assert: tape.Test) => {
  const result = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
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

tape("object iter", (assert: tape.Test) => {
  const result = iter({ a: 0, b: 1, c: 2 })
    .map(([k, v]) => [v, k])
    .toMap(
      ([k, _v]) => k,
      ([_k, v]) => v
    )
    .toObject();

  assert.deepEqual(result, { 0: "a", 1: "b", 2: "c" });

  assert.end();
});

tape("Iterable iter", (assert: tape.Test) => {
  assert.deepEqual(iter(new Set([0, 1, 2, 3])).toArray(), [0, 1, 2, 3]);
  assert.deepEqual(
    iter(
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
  assert.deepEqual(iter(iter([0, 1, 2, 3])).toArray(), [0, 1, 2, 3]);
  assert.end();
});

tape("native for of iter", (assert: tape.Test) => {
  const results: number[] = [];

  for (const value of iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).filter(
    (x) => x % 2 === 0
  )) {
    results.push(value);
  }

  assert.deepEqual(results, [0, 2, 4, 6, 8, 10]);
  assert.end();
});

tape("string", (assert: tape.Test) => {
  assert.deepEqual(iter("asdf").toArray(), ["a", "s", "d", "f"]);
  assert.end();
});

tape("enumerate", (assert: tape.Test) => {
  assert.deepEqual(iter(["a", "b", "c"]).enumerate().toArray(), [
    [0, "a"],
    [1, "b"],
    [2, "c"],
  ]);
  assert.end();
});

tape("peekable simple", (assert: tape.Test) => {
  const peekable = iter(["a", "b", "c"]).peekable();

  assert.equal(peekable.peek().unwrap(), "a");
  assert.equal(peekable.peek(1).unwrap(), "b");
  assert.equal(peekable.peek(2).unwrap(), "c");
  assert.true(peekable.peek(5).isNone());
  assert.deepEqual(peekable.toArray(), ["a", "b", "c"]);

  assert.end();
});

tape("peekable", (assert: tape.Test) => {
  const peekable = iter(["a", "b", "c"]).peekable();

  assert.equal(peekable.peek().unwrap(), "a");
  assert.equal(peekable.next().value, "a");
  assert.equal(peekable.next().value, "b");
  assert.equal(peekable.peek().unwrap(), "c");
  assert.true(peekable.peek(1).isNone());
  assert.equal(peekable.next().value, "c");

  assert.end();
});

tape("peekable unpeek", (assert: tape.Test) => {
  const peekable = iter(["a", "b", "c"]).peekable();

  assert.equal(peekable.peek().unwrap(), "a");
  assert.equal(peekable.peek(1).unwrap(), "b");
  assert.equal(peekable.peek(2).unwrap(), "c");
  assert.equal(peekable.unpeek().unwrap(), "a");
  assert.equal(peekable.unpeek().unwrap(), "b");
  assert.equal(peekable.unpeek().unwrap(), "c");
  assert.true(peekable.unpeek().isNone());
  assert.true(peekable.next().done);

  assert.end();
});

tape("find", (assert: tape.Test) => {
  assert.equal(
    iter([1, 2])
      .find((i) => i % 2 === 0)
      .unwrap(),
    2
  );
  assert.true(
    iter([1, 2])
      .find((i) => i > 3)
      .isNone()
  );
  assert.end();
});

tape("findAll", (assert: tape.Test) => {
  assert.deepEqual(
    iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .findAll((i) => i % 2 === 0)
      .toArray(),
    [0, 2, 4, 6, 8]
  );
  assert.end();
});

tape("nth", (assert: tape.Test) => {
  const result = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .map((i) => i ** 2)
    .filter((i) => i % 2 === 0)
    .nth(4)
    .unwrap();

  assert.equal(result, 64);
  assert.end();
});

tape("first", (assert: tape.Test) => {
  assert.equal(iter([0, 1, 2]).first().unwrap(), 0);
  assert.end();
});

tape("last", (assert: tape.Test) => {
  assert.equal(iter([0, 1, 2]).last().unwrap(), 2);
  assert.true(iter([]).last().isNone());
  assert.end();
});

tape("index", (assert: tape.Test) => {
  const result = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .map((x, index) => index ** 2)
    .filter((x, index) => index % 2 === 0)
    .map((x, index) => index)
    .toArray();

  assert.deepEqual(result, [0, 1, 2, 3, 4]);
  assert.end();
});

tape("forEach", (assert: tape.Test) => {
  let count = 0;

  iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .forEach(() => {
      count++;
    })
    .toArray();

  assert.deepEqual(count, 10);
  assert.end();
});

tape("types", (assert: tape.Test) => {
  const result = iter([{ key: "value" }, { key: 10 }])
    .map((obj) => obj.key)
    .filter((key) => typeof key === "string")
    .toArray();

  assert.deepEqual(result, ["value"]);
  assert.end();
});

tape("concat", (assert: tape.Test) => {
  const result = iter([0, 1, 2])
    .concat(iter([3, 4, 5]))
    .toArray();

  assert.deepEqual(result, [0, 1, 2, 3, 4, 5]);
  assert.end();
});

tape("consume", (assert: tape.Test) => {
  const array: number[] = [];

  iter([0, 1, 2])
    .forEach((value) => {
      array.push(value);
    })
    .consume();

  assert.deepEqual(array, [0, 1, 2]);
  assert.end();
});

tape("unflatten", (assert: tape.Test) => {
  const array = iter([0, 0, 1, 1, 2, 2])
    .unflatten((iter) => {
      const next = iter.next();

      if (next.done) {
        return next;
      } else {
        const nextNext = iter.next();

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

tape("reverse", (assert: tape.Test) => {
  assert.deepEqual(iter([1, 2, 3]).reverse().toArray(), [3, 2, 1]);
  assert.end();
});

tape("any/some/none/all", (assert: tape.Test) => {
  assert.true(iter([1, 2, 3]).any((x) => x % 2 === 0));
  assert.true(iter([1, 2, 3]).some((x) => x % 2 === 1));
  assert.true(iter([1, 2, 3]).none((x) => typeof x === "object"));
  assert.true(iter([1, 2, 3]).all((x) => typeof x === "number"));
  assert.false(iter([1, 2, 3]).all((x) => typeof x !== "number"));
  assert.end();
});
