---
title: get_context()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_context()` is for getting the data passing through the middleware chain. It takes `req` parameter.

Exmaple usage:

```c
example_context_t *example_ctx = (example_context_t *)get_context(req);
```
