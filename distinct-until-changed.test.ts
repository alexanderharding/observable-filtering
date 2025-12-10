import { assertEquals } from "@std/assert";
import { Observable } from "@xan/observable";
import { materialize, ObserverNotification, of, thrown } from "@xan/observable-utility";
import { pipe } from "@xan/pipe";
import { distinctUntilChanged } from "./distinct-until-changed.ts";
import { Observer } from "@xan/observer";
import { Subject } from "@xan/subject";

Deno.test(
  "distinctUntilChanged should pump throws right through itself",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const error = new Error("thrown!");

    const materialized = pipe(
      thrown(error),
      distinctUntilChanged(),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert: next values are ignored, threw value is propagated
    assertEquals(notifications, [["T", error]]);
  },
);

Deno.test("distinctUntilChanged should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, distinctUntilChanged(), materialize());

  // Act
  materialized.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();
  source.return();

  // Assert
  assertEquals(notifications, []);
});

Deno.test(
  "distinctUntilChanged should emit distinct values (no comparator)",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(
      of(1, 1, 1, 2, 2, 3),
      distinctUntilChanged(),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["N", 1], ["N", 2], ["N", 3], ["R"]]);
  },
);

Deno.test(
  "distinctUntilChanged should emit distinct values (with comparator)",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(
      of(1, 1, 1, 2, 2, 3),
      distinctUntilChanged((a) => a === 1),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["N", 1], ["R"]]);
  },
);

Deno.test("distinctUntilChanged should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, distinctUntilChanged(), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        controller.abort();
      },
    }),
  );
  source.next(123);
  source.next(124); // shouldn't be seen
  source.return();

  // Assert
  assertEquals(notifications, [["N", 123]]);
});

Deno.test(
  "distinctUntilChanged should pass objects only if comparator is overridden",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<{ id: number }>> = [];
    const objs = [{ id: 1 }, { id: 1 }, { id: 2 }, { id: 1 }];
    const source = of(...objs);
    // Default comparator: Object.is, so each object is a different reference, all pass
    const materializedDefault = pipe(
      source,
      distinctUntilChanged(),
      materialize(),
    );

    const notificationsDefault: Array<ObserverNotification<{ id: number }>> = [];
    materializedDefault.subscribe(
      new Observer((n) => notificationsDefault.push(n)),
    );
    assertEquals(notificationsDefault, [
      ["N", objs[0]],
      ["N", objs[1]],
      ["N", objs[2]],
      ["N", objs[3]],
      ["R"],
    ]);

    // With custom comparator by id property
    const materializedById = pipe(
      source,
      distinctUntilChanged((prev, curr) => prev.id === curr.id),
      materialize(),
    );
    notifications.length = 0;
    materializedById.subscribe(new Observer((n) => notifications.push(n)));
    // Should only emit when id changes: [1] (emit), [1] (skip), [2] (emit), [1] (emit)
    assertEquals(notifications, [
      ["N", objs[0]],
      ["N", objs[2]],
      ["N", objs[3]],
      ["R"],
    ]);
  },
);
