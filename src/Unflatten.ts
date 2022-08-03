import { Iter } from "./Iter";

export type IUnflattenFn<T, U> = (iter: Iterator<T>) => IteratorResult<U>;

export class Unflatten<T, U> extends Iter<U> {
  private _fn: IUnflattenFn<T, U>;

  constructor(iter: Iterator<T>, fn: IUnflattenFn<T, U>) {
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
