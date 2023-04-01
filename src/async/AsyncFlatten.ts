import type { IFlatIteratorType } from "../Flatten";
import { asyncIter, AsyncIter } from "./AsyncIter";

export class AsyncFlatten<T, D extends number = 1> extends AsyncIter<
  IFlatIteratorType<T, D>
> {
  private _depth: D;
  private _current: AsyncIter<IFlatIteratorType<any, any>> | undefined =
    undefined;

  constructor(iter: AsyncIterator<T>, depth: D = 1 as D) {
    super(iter as any);
    this._depth = depth;
  }

  async next(): Promise<IteratorResult<IFlatIteratorType<T, D>>> {
    if (this._current !== undefined) {
      const currentNext = await this._current.next();

      if (currentNext.done) {
        this._current = undefined;
      } else {
        return currentNext;
      }
    }
    return this._nextRecur();
  }

  private async _nextRecur(): Promise<IteratorResult<any>> {
    const next = await super.next();
    if (next.done) {
      return next;
    } else if (this._depth > 0) {
      const current = asyncIter(next.value).flatten(this._depth - 1);
      const currentNext = await current.next();
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

AsyncIter.prototype.flatten = function flatten(depth: any = 1) {
  return new AsyncFlatten(this, depth);
};
