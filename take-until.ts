import { from, isObservable, Observable } from "@xan/observable";

/**
 * Takes [`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) values from the `source`
 * until the `notifier` [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable)
 * [`nexts`](https://jsr.io/@xan/observer/doc/~/Observer.next) any value.
 * @example
 * ```ts
 * import { takeUntil } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 * import { Subject } from "@xan/subject";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 * const notifier = new Subject<void>();
 *
 * pipe(source, takeUntil(notifier)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * source.next(1);
 * source.next(2);
 * notifier.next();
 * source.next(3);
 * source.return();
 *
 * // console output:
 * // 1
 * // 2
 * // return
 * ```
 */
export function takeUntil<Value>(
  notifier: Observable,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  if (!isObservable(notifier)) {
    throw new TypeError("Parameter 1 is not of type 'Observable'");
  }
  notifier = from(notifier);
  return function takeUntilFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    source = from(source);
    return new Observable((observer) => {
      notifier.subscribe({
        signal: observer.signal,
        next: () => observer.return(),
        return: () => {}, // Ignored
        throw: (value) => observer.throw(value),
      });
      source.subscribe(observer);
    });
  };
}
