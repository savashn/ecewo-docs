---
title: use()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`use()` is for registering a route-specific middleware.

```c
    get("/", use(some_middleware), some_handler);
```

It's necessary to call `reset_middleware()` at the end of the `int main()` function when a middleware is used.