import { AsyncIter } from "./AsyncIter";

export type IAsyncFilterPredicateFn<T, S extends T> = (
  value: T,
  index: number
) => value is S;
export type IAsyncFilterBooleanFn<T> = (value: T, index: number) => boolean;

export class AsyncFilter<T, S extends T> extends AsyncIter<S> {
  private _fn: IAsyncFilterBooleanFn<T> | IAsyncFilterPredicateFn<T, S>;

  constructor(
    iter: AsyncIterator<T>,
    fn: IAsyncFilterBooleanFn<T> | IAsyncFilterPredicateFn<T, S>
  ) {
    super(iter as any);
    this._fn = fn;
  }

  async next(): Promise<IteratorResult<S, undefined>> {
    let result = await super.nextWithIndex();

    while (!result.done) {
      const [value, index] = result.value;

      if (this._fn(value, index)) {
        return { done: false, value };
      }
      result = await super.nextWithIndex();
    }

    return { done: true, value: undefined };
  }
}

AsyncIter.prototype.filter = function filter(fn: any): any {
  return new AsyncFilter(this, fn);
};
