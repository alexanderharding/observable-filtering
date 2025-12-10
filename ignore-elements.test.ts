import { assertEquals } from "@std/assert";
import { pipe } from "@xan/pipe";
import { ignoreElements } from "./ignore-elements.ts";
import { Observer } from "@xan/observer";
import { materialize, type ObserverNotification, of } from "@xan/observable-utility";
import { Observable } from "@xan/observable";
import { Subject } from "@xan/subject";

Deno.test(
  "ignoreElements should ignore all next values but pass return",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of(1, 2, 3);
    const materialized = pipe(source, ignoreElements(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert: should only get a "return" notification
    assertEquals(notifications, [["R"]]);
  },
);

Deno.test("ignoreElements should pump throws right through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const error = new Error("thrown!");
  const errored = new Observable<number>((observer) => {
    observer.next(42);
    observer.throw(error);
  });
  const materialized = pipe(errored, ignoreElements(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert: next values are ignored, threw value is propagated
  assertEquals(notifications, [["T", error]]);
});

Deno.test("ignoreElements should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, ignoreElements(), materialize());

  // Act
  materialized.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();
  source.return();

  // Assert
  assertEquals(notifications, []);
});
