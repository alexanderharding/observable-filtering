import { from, isObservable, Observable } from "@xan/observable";

/**
 * Filters [`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) values from the `source`
 * [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable) that satisfy a specified
 * {@linkcode predicate}.
 * @example
 * ```ts
 * import { filter } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 *
 * const controller = new AbortController();
 * pipe(of(1, 2, 3, 4, 5), filter((value) => value % 2 === 0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 2
 * // 4
 * // return
 * ```
 */
export function filter<Value>(
  predicate: (value: Value, index: number) => boolean,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  if (typeof predicate !== "function") {
    throw new TypeError("Parameter 1 is not of type 'Function'");
  }
  return function filterFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    source = from(source);
    return new Observable((observer) => {
      let index = 0;
      source.subscribe({
        signal: observer.signal,
        next: (value) => predicate(value, index++) && observer.next(value),
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
