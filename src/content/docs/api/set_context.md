---
title: set_context()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`set_context()` is for setting the data to pass through the middleware chain. It takes 4 parameters.

```c
int count = 1;
example_context_t *example_ctx = malloc(sizeof(example_context_t));
example_ctx->example_data = count;
set_context(req, example_ctx, sizeof(example_context_t), example_cleanup_fn);
```
