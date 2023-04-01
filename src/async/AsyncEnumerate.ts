import { AsyncIter } from "./AsyncIter";

export class AsyncEnumerate<T> extends AsyncIter<[number, T]> {
  constructor(iter: AsyncIterator<T>) {
    super(iter as any);
  }

  async next(): Promise<IteratorResult<[number, T], undefined>> {
    const next: IteratorResult<[T, number], undefined> =
      (await super.nextWithIndex()) as any;

    if (next.done) {
      return next as any;
    } else {
      return { value: swap(next.value) };
    }
  }
}

AsyncIter.prototype.enumerate = function enumerate() {
  return new AsyncEnumerate(this);
};

function swap<A, B>(array: [A, B]): [B, A] {
  const tmp = array[0],
    newArray: [B, A] = array as any;
  newArray[0] = array[1];
  newArray[1] = tmp;
  return newArray;
}
