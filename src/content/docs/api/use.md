---
title: use()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`use()` is aa macro for registering a route-specific middleware.

```c
#define use(...) (MiddlewareArray){(MiddlewareHandler[]){__VA_ARGS__}, sizeof((MiddlewareHandler[]){__VA_ARGS__}) / sizeof(MiddlewareHandler), 1}
```

Example usage:

```c
    get("/", use(some_middleware), some_handler);
```

It's necessary to call `reset_middleware()` at the end of the `int main()` function when a middleware is used.
