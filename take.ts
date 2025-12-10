import { from, isObservable, Observable } from "@xan/observable";
import { empty } from "@xan/observable-utility";

/**
 * Takes the first {@linkcode count} values [`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) by the `source`
 * [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable).
 * @example
 * ```ts
 * import { take } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 *
 * const controller = new AbortController();
 * pipe(of(1, 2, 3, 4, 5), take(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 1
 * // 2
 * // return
 * ```
 */
export function take<Value>(
  count: number,
): (source: Observable<Value>) => Observable<Value> {
  return function takeFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    if (count <= 0 || Number.isNaN(count)) return empty;
    source = from(source);
    if (count === Infinity) return source;
    return new Observable((observer) => {
      let seen = 0;
      source.subscribe({
        signal: observer.signal,
        next(value) {
          // Increment the number of values we have seen,
          // then check it against the allowed count to see
          // if we are still letting values through.
          if (++seen > count) return;
          observer.next(value);
          // If we have met or passed our allowed count,
          // we need to complete. We have to do <= here,
          // because reentrant code will increment `seen` twice.
          if (count <= seen) observer.return();
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
