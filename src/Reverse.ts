import { Iter } from "./Iter";

export class Reverse<T> extends Iter<T> {
  private index = 0;
  private reversed = false;
  private values: IteratorResult<T, undefined>[] = [];

  constructor(iter: Iterator<T>) {
    super(iter);
  }

  next(): IteratorResult<T, undefined> {
    if (!this.reversed) {
      let next = super.next();

      while (!next.done) {
        this.values.push(next);
        next = super.next();
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

Iter.prototype.reverse = function reverse() {
  return new Reverse(this);
};
