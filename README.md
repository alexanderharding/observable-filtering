# @xan/observable-filtering

[`Observable`](https://jsr.io/@xan/observable/doc/~/Observable) filtering extensions.

## Build

Automated by [JSR](https://jsr.io/).

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { take } from "@xan/observable-filtering";
import { of } from "@xan/observable-utility";
import { pipe } from "@xan/pipe";

const controller = new AbortController();
pipe(of(1, 2, 3, 4, 5), take(2)).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log(value),
});

// console output:
// 1
// 2
// return
```

```ts
import { distinctUntilChanged } from "@xan/observable-filtering";
import { of } from "@xan/observable-utility";
import { pipe } from "@xan/pipe";

const controller = new AbortController();
pipe(of(1, 1, 1, 2, 2, 3), distinctUntilChanged()).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log(value),
});

// console output:
// 1
// 2
// 3
// return
```

```ts
import { takeUntil } from "@xan/observable-filtering";
import { of } from "@xan/observable-utility";
import { pipe } from "@xan/pipe";
import { Subject } from "@xan/subject";

const controller = new AbortController();
const source = new Subject<number>();
const notifier = new Subject<void>();

pipe(source, takeUntil(notifier)).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log(value),
});

source.next(1);
source.next(2);
notifier.next();
source.next(3);
source.return();

// console output:
// 1
// 2
// return
```

# Glossary And Semantics

- [@xan/observable](https://jsr.io/@xan/observable#glossary-and-semantics)
