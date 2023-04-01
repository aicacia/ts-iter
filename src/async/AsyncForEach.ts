import { AsyncIter } from "./AsyncIter";

export type IAsyncForEachFn<T> = (value: T, index: number) => void;

export class AsyncForEach<T> extends AsyncIter<T> {
  private _fn: (tuple: [value: T, index: number]) => T;

  constructor(iter: AsyncIterator<T>, fn: IAsyncForEachFn<T>) {
    super(iter);
    this._fn = ([value, index]) => {
      fn(value, index);
      return value;
    };
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    const next = await super.nextWithIndex();

    if (next.done) {
      return next;
    } else {
      return { done: false, value: this._fn(next.value) };
    }
  }
}

AsyncIter.prototype.forEach = function forEach(fn: any) {
  return new AsyncForEach(this, fn);
};
