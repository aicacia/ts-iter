import { Iter } from "./Iter";

export type IMapFn<A, B> = (value: A, index: number) => B;

export class Map<A, B> extends Iter<B> {
  private _fn: (tuple: [value: A, index: number]) => B;

  constructor(iter: Iterator<A>, fn: IMapFn<A, B>) {
    super(iter as any as Iterator<B>);
    this._fn = ([value, index]) => fn(value, index);
  }

  next(): IteratorResult<B, undefined> {
    const next = super.nextWithIndex();

    if (next.done) {
      return next;
    } else {
      return { done: false, value: this._fn(next.value as any) };
    }
  }
}

Iter.prototype.map = function map(fn: any) {
  return new Map(this, fn);
};
