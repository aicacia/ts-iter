import { Iter } from "./Iter";

export type IMapFn<A, B> = (value: A, index: number) => B;

export class Map<A, B> extends Iter<B> {
  private _fn: IMapFn<A, B>;

  constructor(iter: Iterator<A>, fn: IMapFn<A, B>) {
    super(iter as any);
    this._fn = fn;
  }

  next(): IteratorResult<B, undefined> {
    const next = super.nextWithIndex();

    if (next.done) {
      return next;
    } else {
      const [value, index] = next.value;
      return {
        done: false,
        value: this._fn(value as any, index),
      };
    }
  }
}

Iter.prototype.map = function map(fn: any) {
  return new Map(this, fn);
};
