import { Iter } from "./Iter";

export class Skip<T> extends Iter<T> {
  private _skipped: number;
  private _skip: number;

  constructor(iter: Iterator<T>, skip: number) {
    super(iter);
    this._skipped = 0;
    this._skip = (skip <= 0 ? 0 : skip) | 0;
  }

  next(): IteratorResult<T, undefined> {
    let result = super.next();

    while (!result.done) {
      if (this._skipped <= this._skip) {
        this._skipped += 1;
        result = super.next();
      } else {
        return result;
      }
    }

    return { done: true, value: undefined };
  }
}

Iter.prototype.skip = function skip(skip: any) {
  return new Skip(this, skip);
};
