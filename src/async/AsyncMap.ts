import { AsyncIter } from "./AsyncIter";

export type IAsyncMapFn<A, B> = (value: A, index: number) => B;

export class AsyncMap<A, B> extends AsyncIter<B> {
  private _fn: IAsyncMapFn<A, B>;

  constructor(iter: AsyncIterator<A>, fn: IAsyncMapFn<A, B>) {
    super(iter as any as AsyncIterator<B>);
    this._fn = fn;
  }

  async next(): Promise<IteratorResult<B, undefined>> {
    const next = await super.nextWithIndex();

    if (next.done) {
      return next;
    } else {
      return {
        done: false,
        value: this._fn(next.value[0] as any, next.value[1]),
      };
    }
  }
}

AsyncIter.prototype.map = function map(fn: any) {
  return new AsyncMap(this, fn);
};
