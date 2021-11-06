import { Iter } from "./Iter";

export type IToMapFn<A, B> = (value: A, index: number) => B;

const defaultKeyFn = <A, B>(key: A): B => key as any;
const defaultValueFn = <A, B>(value: A): B => value as any;

export class ToMap<T, K extends string | number | symbol, V> extends Iter<
  [K, V]
> {
  private _map: (tuple: [value: any, index: number]) => [K, V];

  constructor(
    iter: Iterator<T>,
    keyFn: IToMapFn<T, K> = defaultKeyFn,
    valueFn: IToMapFn<T, V> = defaultValueFn
  ) {
    super(iter as any as Iterator<[K, V]>);
    this._map = ([value, index]) =>
      [keyFn(value, index), valueFn(value, index)] as [K, V];
  }

  toObject(): Record<K, V> {
    return this.reduce<Record<K, V>>({} as Record<K, V>, (object, value) => {
      object[value[0]] = value[1];
      return object;
    });
  }

  next(): IteratorResult<[K, V], undefined> {
    const next = super.nextWithIndex();

    if (next.done) {
      return next as any;
    } else {
      return { done: false, value: this._map(next.value) };
    }
  }
}

Iter.prototype.toMap = function toMap(keyFn: any, valueFn: any) {
  return new ToMap(this, keyFn, valueFn);
};
