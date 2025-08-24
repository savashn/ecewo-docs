---
title: set_context()
description: Minimalist and easy-to-use C web framework
---

`set_context()` is for setting the data to pass through the middleware chain. It takes 4 parameters.

```c
void set_context(Req *req, void *data, size_t size, void (*cleanup)(void *));
```

Example usage:

```c
int count = 1;

example_context_t *example_ctx = malloc(sizeof(example_context_t));

example_ctx->example_data = count;

set_context(example_ctx, sizeof(example_context_t), example_cleanup_fn);
```

See the [Passing Data Chapter](/docs/middleware/#passing-data) for more information.
