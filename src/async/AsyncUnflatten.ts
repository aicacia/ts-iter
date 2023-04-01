import { AsyncIter } from "./AsyncIter";

export type IAsyncUnflattenFn<T, U> = (
  iter: AsyncIterator<T>
) => Promise<IteratorResult<U>>;

export class AsyncUnflatten<T, U> extends AsyncIter<U> {
  private _fn: IAsyncUnflattenFn<T, U>;

  constructor(iter: AsyncIterator<T>, fn: IAsyncUnflattenFn<T, U>) {
    super(iter as any);
    this._fn = fn;
  }

  async next(): Promise<IteratorResult<U>> {
    return this._fn(this._iter as any);
  }
}

AsyncIter.prototype.unflatten = function unflatten(fn: any) {
  return new AsyncUnflatten(this, fn);
};
