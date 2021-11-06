import { Iter } from "./Iter";

export type IForEachFn<T> = (value: T, index: number) => void;

export class ForEach<T> extends Iter<T> {
  private _fn: (tuple: [value: T, index: number]) => T;

  constructor(iter: Iterator<T>, fn: IForEachFn<T>) {
    super(iter);
    this._fn = ([value, index]) => {
      fn(value, index);
      return value;
    };
  }

  next(): IteratorResult<T, undefined> {
    const next = super.nextWithIndex();

    if (next.done) {
      return next;
    } else {
      return { done: false, value: this._fn(next.value) };
    }
  }
}

Iter.prototype.forEach = function forEach(fn: any) {
  return new ForEach(this, fn);
};
