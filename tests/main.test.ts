import { expect, test } from "vitest";
import { Ok, Err, Result } from "../src/index";

test("Result with value", () => {
  const successfulFunction = (): Result<string, Error> => {
    return Ok("This is a value");
  };

  const result = successfulFunction();

  expect(result.isOk()).toBe(true);
  expect(result.isErr()).toBe(false);
  expect(result.unwrap()).toBe("This is a value");
});

test("Result with error", () => {
  const failingFunction = (): Result<string, Error> => {
    return Err(new Error("This is an error"));
  };

  const result = failingFunction();

  expect(result.isOk()).toBe(false);
  expect(result.isErr()).toBe(true);
  expect(result.unwrapErr()).toBeInstanceOf(Error);
  expect(result.unwrap).toThrowError();
});
