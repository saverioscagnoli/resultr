/**
 * Copyright (c) 2025 Saverio Scagnoli
 *
 * Permission is hereby granted, free of charge, to any person
 * Obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * Represents the result of an operation that can either succeed or fail.
 */
class Result<V, E extends Error> {
  /**
   * The value of the result.
   */
  value?: V;
  /**
   * The error of the result.
   */
  error?: E;

  public constructor(value?: V, error?: E) {
    this.value = value;
    this.error = error;
  }

  /**
   * Checks whether the value of the result exists.
   * NOTE: if this returns true, then the value is guaranteed to be undefined.
   */
  public isOk(): boolean {
    return this.error === undefined;
  }

  /**
   * Checks whether the error of the result exists.
   * NOTE: if this returns true, then the error is guaranteed to be undefined.
   */
  public isErr(): boolean {
    return !this.isOk();
  }

  /**
   * Returns the value of the result.
   * Will throw an error if the result is an error.
   * `isOk` or `isErr` should be called before this method,
   * to check if the result is an error or not.
   *
   * @example
   * ```ts
   * let result = someFunctionThatCouldFail();
   *
   * if (result.isOk()) {
   *    // Handle the success
   *    console.log(result.unwrap());
   * } else {
   *    // Handle the error
   *    // ...
   * }
   * ```
   */
  public unwrap(): V {
    if (this.isErr()) {
      throw this.error;
    }

    return this.value as V;
  }

  /**
   * Returns the error of the result.
   * Will throw an error if the result is not an error.
   *
   * @example
   * ```ts
   * let result = someFunctionThatCouldFail();
   *
   * if (result.isOk()) {
   *   // Handle the success
   *  console.log(result.unwrap());
   * } else {
   *  // Handle the error
   * console.error(result.unwrapErr());
   * }
   */
  public unwrapErr(): E {
    if (this.isOk()) {
      throw new Error("Called unwrapErr on an Ok result");
    }

    return this.error as E;
  }
}

/**
 * Creates a new successful Result with the given value.
 * Calling unwrap on this result will return the value.
 * @param value The value of the result
 * @returns A successful result
 */
function Ok<V>(value: V): Result<V, never> {
  return new Result(value);
}

/**
 * Creates a new failed Result with the given error.
 * @param error The error of the result
 * @returns A failed result
 */
function Err<E extends Error>(error: E): Result<never, E> {
  return new Result(undefined as never, error);
}

type SyncOrAsync<V> = V | Promise<V>;

/**
 * Converts a function that can throw an error into a Result.
 * Very frequently in typescript, it is ignored that widely-used
 * functions can throw errors. Functions such as JSON.parse, fs.readFileSync,
 * and many others. This function provides a way to not write the verbiose try-catch
 * block, and having a nice result object to work with.
 * @param fn callback function where the problematic function is called
 * @returns A Result object
 * @example
 * ```ts
 * const result = resultr(() => JSON.parse('{"key": "value"}'));
 * if (result.isOk()) {
 *    console.log(result.unwrap());
 * } else {
 *    console.error(result.unwrapErr());
 * }
 * ```
 *
 * If the callback function returns a Promise, the function will return a Promise<Result<V, E>>,
 * so you the function can be awaited.
 *
 * @example
 * ```ts
 * const result = await resultr(() => fetch('https://jsonplaceholder.typicode.com/todos/1'));
 * if (result.isOk()) {
 *    const json = await result.unwrap().json();
 *    console.log(json);
 * } else {
 *    console.error(result.unwrapErr());
 * }
 * ```
 */
function resultr<V, E extends Error>(
  fn: () => Promise<V>
): Promise<Result<V, E>>;
function resultr<V, E extends Error>(fn: () => V): Result<V, E>;
function resultr<V, E extends Error>(
  fn: () => SyncOrAsync<V>
): SyncOrAsync<Result<V, E>> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then(Ok)
        .catch(error =>
          Err(
            error instanceof Error
              ? (error as E)
              : (new Error(String(error)) as E)
          )
        ) as Promise<Result<V, E>>;
    } else {
      return Ok(result);
    }
  } catch (error) {
    return Err(
      error instanceof Error ? (error as E) : (new Error(String(error)) as E)
    );
  }
}

export { Err, Ok, Result, resultr };
