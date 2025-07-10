---
title: destroy_req()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`destroy_req()` is using when the `Req` object has been deep copied. It is necessary to free the memory of the deep copy of `Req` object, especially for the async operations.

```c
void destroy_req(Req *req);
```

Example usage:

```c
typedef struct
{
    Res *res;
} ctx_t;

void handler(Req *req, Res *res)
{
    ctx_t *ctx = malloc(sizeof(*ctx));
    ctx->req = copy_req(req);
    destroy_req(ctx->req);
}
```
