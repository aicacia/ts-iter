import { AsyncIter } from "./AsyncIter";

export class AsyncReverse<T> extends AsyncIter<T> {
  private index = 0;
  private reversed = false;
  private values: IteratorResult<T, undefined>[] = [];

  constructor(iter: AsyncIterator<T>) {
    super(iter);
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    if (!this.reversed) {
      let next = await super.next();

      while (!next.done) {
        this.values.push(next);
        next = await super.next();
      }
      this.reversed = true;
      this.index = this.values.length;
    }
    if (this.index === 0) {
      return { done: true, value: undefined };
    } else {
      this.index -= 1;
      return this.values[this.index];
    }
  }
}

AsyncIter.prototype.reverse = function reverse() {
  return new AsyncReverse(this);
};
