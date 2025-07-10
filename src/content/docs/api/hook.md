---
title: hook()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`hook()` is for registering a global middleware. It must be registered in `src/main.c`.

```c
void hook(MiddlewareHandler middleware_handler);
```

Example usage:

```c
hook(some_middleware);
```

It's necessary to call `reset_middleware()` at the end of the `int main()` function when a middleware is used.