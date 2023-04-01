import { some, none, type Option } from "@aicacia/option";
import { AsyncIter } from "./AsyncIter";

export class AsyncPeekable<T> extends AsyncIter<T> {
  private peeked: T[] = [];

  unpeekAll() {
    this.peeked.length = 0;
    return this;
  }

  unpeek(): Option<T> {
    if (this.peeked.length > 0) {
      return some(this.peeked.shift() as T);
    } else {
      return none();
    }
  }

  async peek(offset = 0): Promise<Option<T>> {
    if (offset < this.peeked.length) {
      return some(this.peeked[offset]);
    } else {
      let index = this.peeked.length - offset - 1,
        next = await super.next();

      while (!next.done) {
        this.peeked.push(next.value);

        if (--index <= 0) {
          break;
        } else {
          next = await super.next();
        }
      }

      if (next.done) {
        return none();
      } else {
        return some(next.value);
      }
    }
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    const peeked = this.unpeek();

    if (peeked.isSome()) {
      return { done: false, value: peeked.unwrap() };
    }

    const next = await super.next();

    if (next.done) {
      return next as any;
    } else {
      return { done: false, value: next.value };
    }
  }
}

AsyncIter.prototype.peekable = function peekable() {
  return new AsyncPeekable(this);
};
