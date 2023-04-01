import { AsyncIter } from "./AsyncIter";

export class AsyncTake<T> extends AsyncIter<T> {
  private _taken: number;
  private _count: number;

  constructor(iter: AsyncIterator<T>, count: number) {
    super(iter);
    this._taken = 0;
    this._count = (count <= 0 ? 0 : count) | 0;
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    if (this._taken < this._count) {
      this._taken += 1;
      return super.next();
    } else {
      return { done: true, value: undefined };
    }
  }
}

AsyncIter.prototype.take = function take(count: any) {
  return new AsyncTake(this, count);
};
