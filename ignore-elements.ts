import { from, isObservable, Observable } from "@xan/observable";

/**
 * Ignores all [`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) values from the
 * `source` [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable).
 * @example
 * ```ts
 * import { ignoreElements } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 *
 * const controller = new AbortController();
 * pipe(of(1, 2, 3, 4, 5), ignoreElements()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // return
 * ```
 */
export function ignoreElements<Value>(): (
  source: Observable<Value>,
) => Observable<Value> {
  return function ignoreElementsFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    source = from(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: () => {}, // Ignore all values
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      })
    );
  };
}
