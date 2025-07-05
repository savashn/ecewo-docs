---
title: destroy_res()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`destroy_res()` is using when the `Res` object has been deep copied. It is necessary to free the memory of the deep copy of `Res` object, especially for the async operations.

```c
typedef struct
{
    Res *res;
} ctx_t;

void handler(Req *req, Res *res)
{
    ctx_t *ctx = malloc(sizeof(*ctx));
    ctx->res = copy_res(res);
    destroy_res(ctx->res);
}
```
