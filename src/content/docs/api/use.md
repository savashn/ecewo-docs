---
title: use()
description: Minimalist and easy-to-use C web framework
---

`use()` is aa macro for registering a route-specific middleware.

Example usage:

```c
    get("/", use(first_middleware, second_middleware), handler);
```
