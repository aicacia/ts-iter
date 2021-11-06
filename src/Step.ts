import { Iter } from "./Iter";

export class Step<T> extends Iter<T> {
  private _stepped: number;
  private _step: number;

  constructor(iter: Iterator<T>, step: number) {
    super(iter);
    this._stepped = 0;
    this._step = step <= 0 ? 1 : step | 0;
  }

  next(): IteratorResult<T, undefined> {
    let result = super.next();

    while (!result.done) {
      if (this._stepped < this._step) {
        this._stepped += 1;
        result = super.next();
      } else {
        this._stepped = 0;
        return result;
      }
    }

    return { done: true, value: undefined };
  }
}

Iter.prototype.step = function step(step: any) {
  return new Step(this, step);
};
