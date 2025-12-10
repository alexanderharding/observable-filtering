import { assertEquals, assertStrictEquals } from "@std/assert";
import { pipe } from "@xan/pipe";
import { drop } from "./drop.ts";
import { Observer } from "@xan/observer";
import { empty, materialize, never, type ObserverNotification, of } from "@xan/observable-utility";

Deno.test(
  "drop should return an empty observable if the count is less than 0",
  () => {
    // Arrange
    const source = of(1, 2, 3);

    // Act
    const result = pipe(source, drop(-1));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test("drop should return the source observable if the count is 0", () => {
  // Arrange
  const source = of(1, 2, 3);

  // Act
  const result = pipe(source, drop(0));

  // Assert
  assertStrictEquals(result, source);
});

Deno.test("drop should return empty if the count is NaN", () => {
  // Arrange
  const source = of(1, 2, 3);

  // Act
  const result = pipe(source, drop(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("drop should return the never if the count is Infinity", () => {
  // Arrange
  const source = of(1, 2, 3);

  // Act
  const result = pipe(source, drop(Infinity));

  // Assert
  assertStrictEquals(result, never);
});

Deno.test(
  "drop should drop the items if the count is a positive number",
  () => {
    // Arrange
    const source = of(1, 2, 3, 4, 5);
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(source, drop(2), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["N", 3], ["N", 4], ["N", 5], ["R"]]);
  },
);
