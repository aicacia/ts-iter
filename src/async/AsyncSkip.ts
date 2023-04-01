import { AsyncIter } from "./AsyncIter";

export class AsyncSkip<T> extends AsyncIter<T> {
  private _skipped: number;
  private _skip: number;

  constructor(iter: AsyncIterator<T>, skip: number) {
    super(iter);
    this._skipped = 0;
    this._skip = (skip <= 0 ? 0 : skip) | 0;
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    let result = await super.next();

    while (!result.done) {
      if (this._skipped <= this._skip) {
        this._skipped += 1;
        result = await super.next();
      } else {
        return result;
      }
    }

    return { done: true, value: undefined };
  }
}

AsyncIter.prototype.skip = function skip(skip: any) {
  return new AsyncSkip(this, skip);
};
