import type {
  AsyncFilter,
  IAsyncFilterBooleanFn,
  IAsyncFilterPredicateFn,
} from "./AsyncFilter";
import type { AsyncForEach, IAsyncForEachFn } from "./AsyncForEach";
import type { IAsyncMapFn, AsyncMap } from "./AsyncMap";
import type { AsyncMerge } from "./AsyncMerge";
import type { AsyncSkip } from "./AsyncSkip";
import type { AsyncStep } from "./AsyncStep";
import type { AsyncTake } from "./AsyncTake";
import type { IAsyncToMapFn, AsyncToMap } from "./AsyncToMap";
import type { AsyncUnflatten, IAsyncUnflattenFn } from "./AsyncUnflatten";
import type { AsyncEnumerate } from "./AsyncEnumerate";
import type { AsyncPeekable } from "./AsyncPeekable";
import type { AsyncFlatten } from "./AsyncFlatten";
import type { AsyncReverse } from "./AsyncReverse";
import { none, some, type Option } from "@aicacia/option";

export class AsyncIter<T>
  implements
    AsyncIterable<T>,
    AsyncIterator<T, undefined, undefined>,
    AsyncIterableIterator<T>
{
  protected _iter: AsyncIterator<T>;
  protected _index = 0;

  constructor(iter: AsyncIterator<T>) {
    this._iter = iter;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  iter(): AsyncIter<T> {
    return this;
  }

  next(): Promise<IteratorResult<T, undefined>> {
    return this._iter.next();
  }

  async nextWithIndex(): Promise<IteratorResult<[T, number], undefined>> {
    const next = await this._iter.next();

    if (next.done) {
      return next;
    } else {
      return { value: [next.value, this._index++] };
    }
  }

  enumerate(): AsyncEnumerate<T>;
  enumerate(): any {
    throw new Error("async/AsyncEnumerate was not imported!");
  }

  peekable(): AsyncPeekable<T>;
  peekable(): any {
    throw new Error("async/AsyncPeekable was not imported!");
  }

  forEach(fn: IAsyncForEachFn<T>): AsyncForEach<T>;
  forEach(_fn: any): any {
    throw new Error("async/AsyncForEach was not imported!");
  }

  map<B>(fn: IAsyncMapFn<T, B>): AsyncMap<T, B>;
  map(_fn: any): any {
    throw new Error("async/AsyncMap was not imported!");
  }

  merge(iter: AsyncIterator<T>): AsyncMerge<T>;
  merge(_iter: any): any {
    throw new Error("async/AsyncMerge was not imported!");
  }

  concat(iter: AsyncIterator<T>): AsyncMerge<T> {
    return this.merge(iter);
  }

  filter<S extends T>(fn: IAsyncFilterPredicateFn<T, S>): AsyncFilter<T, S>;
  filter(fn: IAsyncFilterBooleanFn<T>): AsyncFilter<T, T>;
  filter(_fn: any): any {
    throw new Error("async/AsyncFilter was not imported!");
  }

  step(step: number): AsyncStep<T>;
  step(_step: any): any {
    throw new Error("async/AsyncStep was not imported!");
  }

  skip(skip: number): AsyncSkip<T>;
  skip(_skip: any): any {
    throw new Error("async/AsyncSkip was not imported!");
  }

  take(count: number): AsyncTake<T>;
  take(_count: any): any {
    throw new Error("async/AsyncTake was not imported!");
  }

  toMap<K extends string | number | symbol, V>(
    keyFn?: IAsyncToMapFn<T, K>,
    valueFn?: IAsyncToMapFn<T, V>
  ): AsyncToMap<T, K, V>;
  toMap(_keyFn: any, _valueFn: any): any {
    throw new Error("async/AsyncToMap was not imported!");
  }

  flatten<D extends number = 1>(depth?: D): AsyncFlatten<T, D>;
  flatten(_depth: any): any {
    throw new Error("async/AsyncFlatten was not imported!");
  }

  unflatten<U>(fn: IAsyncUnflattenFn<T, U>): AsyncUnflatten<T, U>;
  unflatten(_fn: any): any {
    throw new Error("async/AsyncUnflatten was not imported!");
  }

  reverse(): AsyncReverse<T> {
    throw new Error("async/AsyncReverse was not imported!");
  }

  count() {
    return this.reduce(0, (count) => count + 1);
  }

  async consume() {
    let next = await this.next();

    while (!next.done) {
      next = await this.next();
    }

    return this;
  }

  toArray() {
    return this.reduce<T[]>([], (array, value) => {
      array.push(value);
      return array;
    });
  }

  async join(separator?: string): Promise<string> {
    return (await this.toArray()).join(separator);
  }

  async indexOf(value: T): Promise<number> {
    let next = await this.next(),
      index = 0;

    while (!next.done) {
      if (next.value === value) {
        return index;
      }
      index++;
      next = await this.next();
    }

    return -1;
  }

  async findIndex(fn: (value: T, index: number) => boolean): Promise<number> {
    let next = await this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (fn(value, index)) {
        return index;
      }
      next = await this.nextWithIndex();
    }

    return -1;
  }

  async find(fn: (value: T, index: number) => boolean): Promise<Option<T>> {
    let next = await this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (fn(value, index)) {
        return some(value);
      }
      next = await this.nextWithIndex();
    }

    return none();
  }

  findAll(fn: (value: T) => boolean) {
    return this.filter(fn);
  }

  async nth(index = 0): Promise<Option<T>> {
    let next = await this.next();

    if (index < 0) {
      index = 0;
    }

    while (!next.done) {
      if (index-- <= 0) {
        return some(next.value);
      }
      next = await this.next();
    }

    return none();
  }

  first() {
    return this.nth(0);
  }

  async last(): Promise<Option<T>> {
    let current = await this.next();

    while (!current.done) {
      const next = await this.next();

      if (next.done) {
        return some(current.value);
      } else {
        current = next;
      }
    }

    return none();
  }

  async any(fn: (value: T, index: number) => boolean) {
    return (await this.findIndex(fn)) !== -1;
  }
  async some(fn: (value: T, index: number) => boolean) {
    return this.any(fn);
  }
  async none(fn: (value: T, index: number) => boolean) {
    return (await this.findIndex(fn)) === -1;
  }

  async all(fn: (value: T, index: number) => boolean) {
    let next = await this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (!fn(value, index)) {
        return false;
      }
      next = await this.nextWithIndex();
    }

    return true;
  }

  async reduce<C>(
    acc: C,
    fn: (acc: C, value: T, index: number) => C
  ): Promise<C> {
    let next = await this.next();

    while (!next.done) {
      const value = next.value;
      acc = fn(acc, value, this._index - 1);
      next = await this.next();
    }

    return acc;
  }
}

export function asyncIter<T>(
  value:
    | T[]
    | Iterator<T>
    | AsyncIterator<T>
    | AsyncIter<T>
    | AsyncIterable<T>
    | Iterable<T>
): AsyncIter<T>;
export function asyncIter<O>(
  value:
    | O
    | Iterable<[keyof O, O[keyof O]]>
    | AsyncIterable<[keyof O, O[keyof O]]>
): AsyncIter<[keyof O, O[keyof O]]>;

export function asyncIter(value: any): AsyncIter<any> {
  if (value != null) {
    if (typeof value[Symbol.asyncIterator] === "function") {
      return new AsyncIter(value[Symbol.asyncIterator]());
    } else if (typeof value[Symbol.iterator] === "function") {
      return new AsyncIter(value[Symbol.iterator]());
    } else if (typeof value.next === "function") {
      if (value instanceof AsyncIter) {
        return value;
      } else {
        return new AsyncIter(value);
      }
    } else if (typeof value === "object") {
      return asyncIter(Object.entries(value));
    } else {
      return asyncIter([value]);
    }
  } else {
    return asyncIter([] as any[]);
  }
}
