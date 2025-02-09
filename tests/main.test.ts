import { expect, test } from "vitest";
import { Ok, Err, Result, resultr, resultrAsync } from "../src/index";

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

test("resultr function", async () => {
  const invalidJson = "{";
  const result = resultr(() => JSON.parse(invalidJson));

  expect(result.isOk()).toBe(false);
  expect(result.isErr()).toBe(true);
  expect(result.unwrapErr()).toBeInstanceOf(SyntaxError);

  const validJson = "{}";

  const result2 = resultr(() => JSON.parse(validJson));

  expect(result2.isOk()).toBe(true);
  expect(result2.isErr()).toBe(false);
  expect(result2.unwrap()).toEqual({});

  const invalidUrl = "abc";

  const result3 = await resultrAsync(() => fetch(invalidUrl));

  expect(result3.isOk()).toBe(false);
  expect(result3.isErr()).toBe(true);
  expect(result3.unwrapErr()).toBeInstanceOf(TypeError);

  const validUrl = "https://jsonplaceholder.typicode.com/todos/1";

  const result4 = await resultrAsync(() => fetch(validUrl));
  const json = await resultrAsync(() => result4.unwrap().json());

  expect(result4.isOk()).toBe(true);
  expect(result4.isErr()).toBe(false);
  expect(result4.unwrap()).toBeInstanceOf(Response);
  expect(json.isOk()).toBe(true);
  expect(json.isErr()).toBe(false);
  expect(json.unwrap()).toEqual({
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false
  });
});
