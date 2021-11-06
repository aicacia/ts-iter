import { Iter } from "./Iter";

export class Take<T> extends Iter<T> {
  private _taken: number;
  private _count: number;

  constructor(iter: Iterator<T>, count: number) {
    super(iter);
    this._taken = 0;
    this._count = (count <= 0 ? 0 : count) | 0;
  }

  next(): IteratorResult<T, undefined> {
    if (this._taken < this._count) {
      this._taken += 1;
      return super.next();
    } else {
      return { done: true, value: undefined };
    }
  }
}

Iter.prototype.take = function take(count: any) {
  return new Take(this, count);
};
