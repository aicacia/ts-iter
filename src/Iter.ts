import type { Option } from "@aicacia/option";
import type { Filter, IFilterBooleanFn, IFilterPredicateFn } from "./Filter";
import type { ForEach, IForEachFn } from "./ForEach";
import type { IMapFn, Map } from "./Map";
import type { Merge } from "./Merge";
import type { Skip } from "./Skip";
import type { Step } from "./Step";
import type { Take } from "./Take";
import type { IToMapFn, ToMap } from "./ToMap";
import type { Unflatten, IUnflattenFn } from "./Unflatten";
import type { Enumerate } from "./Enumerate";
import type { Peekable } from "./Peekable";
import type { Flatten } from "./Flatten";
import { none, some } from "@aicacia/option";

export class Iter<T>
  implements
    Iterable<T>,
    Iterator<T, undefined, undefined>,
    IterableIterator<T>
{
  protected _iter: Iterator<T>;
  protected _index = 0;

  constructor(iter: Iterator<T>) {
    this._iter = iter;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  iter(): Iter<T> {
    return this;
  }

  next(): IteratorResult<T, undefined> {
    return this._iter.next();
  }

  nextWithIndex(): IteratorResult<[T, number], undefined> {
    const next = this._iter.next();

    if (next.done) {
      return next;
    } else {
      return { value: [next.value, this._index++] };
    }
  }

  enumerate(): Enumerate<T>;
  enumerate(): any {
    throw new Error("iter/Enumerate was not imported!");
  }

  peekable(): Peekable<T>;
  peekable(): any {
    throw new Error("iter/Peekable was not imported!");
  }

  forEach(fn: IForEachFn<T>): ForEach<T>;
  forEach(_fn: any): any {
    throw new Error("iter/ForEach was not imported!");
  }

  map<B>(fn: IMapFn<T, B>): Map<T, B>;
  map(_fn: any): any {
    throw new Error("iter/Map was not imported!");
  }

  merge(iter: Iterator<T>): Merge<T>;
  merge(_iter: any): any {
    throw new Error("iter/Merge was not imported!");
  }

  concat(iter: Iterator<T>): Merge<T> {
    return this.merge(iter);
  }

  filter<S extends T>(fn: IFilterPredicateFn<T, S>): Filter<T, S>;
  filter(fn: IFilterBooleanFn<T>): Filter<T, T>;
  filter(_fn: any): any {
    throw new Error("iter/Filter was not imported!");
  }

  step(step: number): Step<T>;
  step(_step: any): any {
    throw new Error("iter/Step was not imported!");
  }

  skip(skip: number): Skip<T>;
  skip(_skip: any): any {
    throw new Error("iter/Skip was not imported!");
  }

  take(count: number): Take<T>;
  take(_count: any): any {
    throw new Error("iter/Take was not imported!");
  }

  toMap<K extends string | number | symbol, V>(
    keyFn?: IToMapFn<T, K>,
    valueFn?: IToMapFn<T, V>
  ): ToMap<T, K, V>;
  toMap(_keyFn: any, _valueFn: any): any {
    throw new Error("iter/ToMap was not imported!");
  }

  count() {
    return this.reduce(0, (count) => count + 1);
  }

  consume() {
    let next = this.next();

    while (!next.done) {
      next = this.next();
    }

    return this;
  }

  toArray(): T[] {
    return this.reduce<T[]>([], (array, value) => {
      array.push(value);
      return array;
    });
  }

  join(separator?: string): string {
    return this.toArray().join(separator);
  }

  indexOf(value: T): number {
    let next = this.next(),
      index = 0;

    while (!next.done) {
      if (next.value === value) {
        return index;
      }
      index++;
      next = this.next();
    }

    return -1;
  }

  findIndex(fn: (value: T, index: number) => boolean): number {
    let next = this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (fn(value, index)) {
        return index;
      }
      next = this.nextWithIndex();
    }

    return -1;
  }

  find(fn: (value: T, index: number) => boolean): Option<T> {
    let next = this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (fn(value, index)) {
        return some(value);
      }
      next = this.nextWithIndex();
    }

    return none();
  }

  findAll(fn: (value: T) => boolean) {
    return this.filter(fn);
  }

  nth(index = 0): Option<T> {
    let next = this.next();

    if (index < 0) {
      index = 0;
    }

    while (!next.done) {
      if (index-- <= 0) {
        return some(next.value);
      }
      next = this.next();
    }

    return none();
  }

  first(): Option<T> {
    return this.nth(0);
  }

  last(): Option<T> {
    let current = this.next();

    while (!current.done) {
      const next = this.next();

      if (next.done) {
        return some(current.value);
      } else {
        current = next;
      }
    }

    return none();
  }

  any(fn: (value: T, index: number) => boolean): boolean {
    return this.findIndex(fn) !== -1;
  }
  some(fn: (value: T, index: number) => boolean): boolean {
    return this.any(fn);
  }
  none(fn: (value: T, index: number) => boolean): boolean {
    return this.findIndex(fn) === -1;
  }

  all(fn: (value: T, index: number) => boolean): boolean {
    let next = this.nextWithIndex();

    while (!next.done) {
      const [value, index] = next.value;

      if (!fn(value, index)) {
        return false;
      }
      next = this.nextWithIndex();
    }

    return true;
  }

  flatten<D extends number = 1>(depth?: D): Flatten<T, D>;
  flatten(_depth: any): any {
    throw new Error("iter/Flatten was not imported!");
  }

  unflatten<U>(fn: IUnflattenFn<T, U>): Unflatten<T, U>;
  unflatten(_fn: any): any {
    throw new Error("iter/Unflatten was not imported!");
  }

  reduce<C>(acc: C, fn: (acc: C, value: T, index: number) => C): C {
    let next = this.next();

    while (!next.done) {
      const value = next.value;
      acc = fn(acc, value, this._index - 1);
      next = this.next();
    }

    return acc;
  }

  reverse() {
    return iter(this.toArray().reverse());
  }
}

export function iter<T>(
  value: T[] | Iterator<T> | Iter<T> | Iterable<T>
): Iter<T>;
export function iter<O>(
  value: O | Iterable<[keyof O, O[keyof O]]>
): Iter<[keyof O, O[keyof O]]>;

export function iter(value: any): Iter<any> {
  if (value != null) {
    if (typeof value[Symbol.iterator] === "function") {
      return new Iter(value[Symbol.iterator]());
    } else if (typeof value.next === "function") {
      if (value instanceof Iter) {
        return value;
      } else {
        return new Iter(value);
      }
    } else if (typeof value === "object") {
      return iter(Object.entries(value));
    } else {
      return iter([value]);
    }
  } else {
    return iter([] as any[]);
  }
}
