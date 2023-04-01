import { AsyncIter } from "./AsyncIter";

export type IAsyncToMapFn<A, B> = (value: A, index: number) => B;

const defaultKeyFn = <A, B>(key: A): B => key as any;
const defaultValueFn = <A, B>(value: A): B => value as any;

export class AsyncToMap<
  T,
  K extends string | number | symbol,
  V
> extends AsyncIter<[K, V]> {
  private _map: (tuple: [value: any, index: number]) => [K, V];

  constructor(
    iter: AsyncIterator<T>,
    keyFn: IAsyncToMapFn<T, K> = defaultKeyFn,
    valueFn: IAsyncToMapFn<T, V> = defaultValueFn
  ) {
    super(iter as any as AsyncIterator<[K, V]>);
    this._map = ([value, index]) =>
      [keyFn(value, index), valueFn(value, index)] as [K, V];
  }

  toObject(): Promise<Record<K, V>> {
    return this.reduce<Record<K, V>>({} as Record<K, V>, (object, value) => {
      object[value[0]] = value[1];
      return object;
    });
  }

  async next(): Promise<IteratorResult<[K, V], undefined>> {
    const next = await super.nextWithIndex();

    if (next.done) {
      return next as any;
    } else {
      return { done: false, value: this._map(next.value) };
    }
  }
}

AsyncIter.prototype.toMap = function toMap(keyFn: any, valueFn: any) {
  return new AsyncToMap(this, keyFn, valueFn);
};
