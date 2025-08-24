---
title: arena_copy_res()
description: Minimalist and easy-to-use C web framework
---

`arena_copy_res()` is similar to [copy_res()](/api/copy_res), but it's using for copying the `Res` object into Arena. It is necessary especially for async operations that use arena allocator.

```c
Res *arena_copy_res(Arena *target_arena, const Res *original);
```

Example usage:

```c
typedef struct
{
    Arena *arena;
    Res *res;
} ctx_t;

void handler(Req *req, Res *res)
{
    // Create an arena
    Arena *async_arena = calloc(1, sizeof(Arena));

    // Allocate memory for async
    ctx_t *ctx = arena_alloc(async_arena, sizeof(*ctx)); // use arena_alloc, no malloc

    // Store arena reference
    ctx->arena = async_arena;

    // Copy Res to arena
    ctx->res = arena_copy_res(async_arena, res);

    // Free
    arena_free(ctx->arena);
    free(ctx->arena);
}
```
