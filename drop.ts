import { from, isObservable, type Observable } from "@xan/observable";
import { empty, never } from "@xan/observable-utility";
import { pipe } from "@xan/pipe";
import { filter } from "./filter.ts";

/**
 * Drops the first {@linkcode count} values [`nexted`](https://jsr.io/@xan/observer/doc/~/Observer.next) by the `source`
 * [`Observable`](https://jsr.io/@xan/observable/doc/~/Observable).
 * @example
 * ```ts
 * import { drop } from "@xan/observable-filtering";
 * import { of } from "@xan/observable-utility";
 * import { pipe } from "@xan/pipe";
 *
 * const controller = new AbortController();
 * pipe(of(1, 2, 3, 4, 5), drop(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 3
 * // 4
 * // 5
 * // return
 * ```
 */
export function drop<Value>(
  count: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  if (typeof count !== "number") {
    throw new TypeError("Parameter 1 is not of type 'Number'");
  }
  return function dropFn(source) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObservable(source)) {
      throw new TypeError("Parameter 1 is not of type 'Observable'");
    }
    if (count === 0) return from(source);
    if (count < 0 || Number.isNaN(count)) return empty;
    if (count === Infinity) return never;
    return pipe(
      source,
      filter((_, index) => index >= count),
    );
  };
}
