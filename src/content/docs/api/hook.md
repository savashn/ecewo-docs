---
title: hook()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`hook()` is for registering a global middleware. It must be registered in `main.c`.

```c
void hook(MiddlewareHandler middleware_handler);
```

Example usage:

```c
hook(some_middleware);
```
