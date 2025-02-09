# resultr - Better error handling

Rust-inspired error handling with the `Result` type, implemented in typescript.

`try` and `catch` really suck.

So this library aims to provide a nice and neat way to handle errors.

### Problem

Very often in the javascript world, many that could throw an error and crash your
program are used without the correct error handling, an example is `JSON.parse`:

```js
const result = JSON.parse("{ "a": ");
// This will throw without any warning!
```

### Solution

Use the `Result` type as a return value when you define your functions!

```ts
function couldFail(): Result<number, Error> {
  // This means that the return type is a result with either one set: value (number), or error.
  let r = Math.random();

  if (r < 0.5) {
    Err("This in an error!");
  } else {
    Ok(r);
  }
}
```

In the example above, return a failing result if r < 0.5, else return a successful result.
It should be handled like this:

```js
const r = couldFail();

// Use isOk() to check whether the value of the result exists

if (r.isOk()) {
  // Use unwrap() to get the inner value of the result
  // NOTE: this function throws if the result value doens't exist!
  let inner = r.unwrap();
}

// Or you can use isErr() to check whether the result has an error

if (r.isErr()) {
  // Use unwrapErr() to get the inner error
  // NOTE: this function throws if the error doesnt exist!
  let error = r.unwrapErr();
}
```

### But `JSON.parse` doesn't return a `Result`!

To handle the case where a function can throw but it is not specified, like `fetch` or `JSON.parse`,
you can use the `resultr` function to wrap a call to these problematic functions.

```ts
const value = resultr(() => JSON.parse(...));
// type of `value` is Result<any, Error>
```

This way if the callback function throws, the `resultr` function will catch the error for you, without
the need to write the atrocious try-catch blocks.

You can use the `resultr` function to handle async functions too:

```ts
const res = resultr(() => fetch("..."));
// type of `res` is Promise<Result<Response, Error>>
// So to get the inner result just:
const res = await resultr(() => fetch("..."));
```

## License

MIT License 2025 (c) Saverio Scagnoli
