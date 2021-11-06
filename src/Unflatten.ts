import { Iter } from "./Iter";

export type UnflattenFn<T, U> = (iter: Iterator<T>) => IteratorResult<U>;

export class Unflatten<T, U> extends Iter<U> {
  private _fn: UnflattenFn<T, U>;

  constructor(iter: Iterator<T>, fn: UnflattenFn<T, U>) {
    super(iter as any);
    this._fn = fn;
  }

  next(): IteratorResult<U> {
    return this._fn(this._iter as any);
  }
}

Iter.prototype.unflatten = function unflatten(fn: any) {
  return new Unflatten(this, fn);
};
