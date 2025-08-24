---
title: arena_copy_req()
description: Minimalist and easy-to-use C web framework
---

`arena_copy_req()` is similar to [copy_req()](/api/copy_req), but it's using for copying the `Req` object into Arena. It is necessary especially for async operations that use arena allocator.

```c
Req *arena_copy_req(Arena *target_arena, const Req *original);
```

Example usage:

```c
typedef struct
{
    Arena *arena;
    Req *req;
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
    ctx->req = arena_copy_req(async_arena, req);

    // Free
    arena_free(ctx->arena);
    free(ctx->arena);
}
```
