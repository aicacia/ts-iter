import { Iter } from "./Iter";

export class Merge<T> extends Iter<T> {
  private _other: Iterator<T>;

  constructor(iter: Iterator<T>, other: Iterator<T>) {
    super(iter);
    this._other = other;
  }

  next(): IteratorResult<T, undefined> {
    const next = super.next();

    if (next.done) {
      return this._other.next();
    } else {
      return next;
    }
  }
}

Iter.prototype.merge = function merge(other: any) {
  return new Merge(this, other);
};
