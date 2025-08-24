---
title: hook()
description: Minimalist and easy-to-use C web framework
---

`hook()` is for registering a global middleware. It must be registered in `main.c`.

```c
void hook(MiddlewareHandler middleware_handler);
```

Example usage:

```c
hook(some_middleware);
```
