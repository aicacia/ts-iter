import { AsyncIter } from "./AsyncIter";

export class AsyncMerge<T> extends AsyncIter<T> {
  private _other: AsyncIterator<T>;

  constructor(iter: AsyncIterator<T>, other: AsyncIterator<T>) {
    super(iter);
    this._other = other;
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    const next = await super.next();

    if (next.done) {
      return this._other.next();
    } else {
      return next;
    }
  }
}

AsyncIter.prototype.merge = function merge(other: any) {
  return new AsyncMerge(this, other);
};
