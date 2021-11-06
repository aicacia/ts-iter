import { Iter } from "./Iter";

export type IFilterPredicateFn<T, S extends T> = (
  value: T,
  index: number
) => value is S;
export type IFilterBooleanFn<T> = (value: T, index: number) => boolean;

export class Filter<T, S extends T> extends Iter<S> {
  private _fn: IFilterBooleanFn<T> | IFilterPredicateFn<T, S>;

  constructor(
    iter: Iterator<T>,
    fn: IFilterBooleanFn<T> | IFilterPredicateFn<T, S>
  ) {
    super(iter as any);
    this._fn = fn;
  }

  next(): IteratorResult<S, undefined> {
    let result = super.nextWithIndex();

    while (!result.done) {
      const [value, index] = result.value;

      if (this._fn(value, index)) {
        return { done: false, value };
      }
      result = super.nextWithIndex();
    }

    return { done: true, value: undefined };
  }
}

Iter.prototype.filter = function filter(fn: any): any {
  return new Filter(this, fn);
};
