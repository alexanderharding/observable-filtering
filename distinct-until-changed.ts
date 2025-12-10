import { from, isObservable, Observable } from "@xan/observable";

const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * Only [`nexts`](https://jsr.io/@xan/observer/doc/~/Observer.next) values from the `source`
 * [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable) that are distinct from the previous
 * value according to a specified {@linkcode comparator}. Defaults to comparing with `Object.is`.
 * @example
 * ```ts
 * import { distinctUntilChanged } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 *
 * const controller = new AbortController();
 * pipe(of(1, 1, 1, 2, 2, 3), distinctUntilChanged()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 */
export function distinctUntilChanged<Value>(
  comparator: (previous: Value, current: Value) => boolean = Object.is,
): (source: Observable<Value>) => Observable<Value> {
  if (typeof comparator !== "function") {
    throw new TypeError("Parameter 1 is not of type 'Function'");
  }
  return function distinctUntilChangedFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    source = from(source);
    return new Observable((observer) => {
      let previous: Value | typeof noValue = noValue;
      source.subscribe({
        signal: observer.signal,
        next(current) {
          if (previous === noValue || !comparator(previous, current)) {
            observer.next(previous = current);
          }
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
