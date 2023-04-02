import { Iter } from "./Iter";

export class Enumerate<T> extends Iter<[number, T]> {
  constructor(iter: Iterator<T>) {
    super(iter as any);
  }

  next(): IteratorResult<[number, T], undefined> {
    const next: IteratorResult<[T, number], undefined> =
      super.nextWithIndex() as any;

    if (next.done) {
      return next as any;
    } else {
      return { value: swap(next.value) };
    }
  }
}

Iter.prototype.enumerate = function enumerate() {
  return new Enumerate(this);
};

export function swap<A, B>(array: [A, B]): [B, A] {
  const tmp = array[0],
    newArray: [B, A] = array as any;
  newArray[0] = array[1];
  newArray[1] = tmp;
  return newArray;
}
