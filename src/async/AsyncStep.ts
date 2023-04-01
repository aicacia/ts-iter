import { AsyncIter } from "./AsyncIter";

export class AsyncStep<T> extends AsyncIter<T> {
  private _stepped: number;
  private _step: number;

  constructor(iter: AsyncIterator<T>, step: number) {
    super(iter);
    this._stepped = 0;
    this._step = step <= 0 ? 1 : step | 0;
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    let result = await super.next();

    while (!result.done) {
      if (this._stepped < this._step) {
        this._stepped += 1;
        result = await super.next();
      } else {
        this._stepped = 0;
        return result;
      }
    }

    return { done: true, value: undefined };
  }
}

AsyncIter.prototype.step = function step(step: any) {
  return new AsyncStep(this, step);
};
