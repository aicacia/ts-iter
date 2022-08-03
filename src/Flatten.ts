import { iter, Iter } from "./Iter";

export type IFlatIteratorType<T, D extends number> = {
  done: T;
  recur: T extends ReadonlyArray<infer U>
    ? FlatArray<
        U,
        [
          -1,
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20
        ][D]
      >
    : T;
}[D extends -1 ? "done" : "recur"];

export class Flatten<T, D extends number = 1> extends Iter<
  IFlatIteratorType<T, D>
> {
  private _depth: D;
  private _current: Iter<IFlatIteratorType<any, any>> | undefined = undefined;

  constructor(iter: Iterator<T>, depth: D = 1 as D) {
    super(iter as any);
    this._depth = depth;
  }

  next(): IteratorResult<IFlatIteratorType<T, D>> {
    if (this._current !== undefined) {
      const currentNext = this._current.next();

      if (currentNext.done) {
        this._current = undefined;
      } else {
        return currentNext;
      }
    }
    return this._nextRecur();
  }

  private _nextRecur(): IteratorResult<any> {
    const next = super.next();
    if (next.done) {
      return next;
    } else if (this._depth > 0) {
      const current = iter(next.value).flatten(this._depth - 1);
      const currentNext = current.next();
      if (currentNext.done) {
        return this._nextRecur();
      } else {
        this._current = current;
        return currentNext;
      }
    } else {
      return next;
    }
  }
}

Iter.prototype.flatten = function flatten(depth: any = 1) {
  return new Flatten(this, depth);
};
