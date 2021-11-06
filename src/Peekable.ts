import type { Option } from "@aicacia/option";
import { some, none } from "@aicacia/option";
import { Iter } from "./Iter";

export class Peekable<T> extends Iter<T> {
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

  peek(offset = 0): Option<T> {
    if (offset < this.peeked.length) {
      return some(this.peeked[offset]);
    } else {
      let index = this.peeked.length - offset - 1,
        next = super.next();

      while (!next.done) {
        this.peeked.push(next.value);

        if (--index <= 0) {
          break;
        } else {
          next = super.next();
        }
      }

      if (next.done) {
        return none();
      } else {
        return some(next.value);
      }
    }
  }

  next(): IteratorResult<T, undefined> {
    const peeked = this.unpeek();

    if (peeked.isSome()) {
      return { done: false, value: peeked.unwrap() };
    }

    const next = super.next();

    if (next.done) {
      return next as any;
    } else {
      return { done: false, value: next.value };
    }
  }
}

Iter.prototype.peekable = function peekable() {
  return new Peekable(this);
};
