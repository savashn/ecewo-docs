---
title: use()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`use()` is aa macro for registering a route-specific middleware.

Example usage:

```c
    get("/", use(first_middleware, second_middleware), handler);
```
