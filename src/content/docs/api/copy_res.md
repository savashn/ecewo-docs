---
title: copy_res()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`copy_res()` is using for deep copying the `Res` object. It is necessary especially for async operations.

```c
typedef struct
{
    Res *res;
} ctx_t;

void handler(Req *req, Res *res)
{
    ctx_t *ctx = malloc(sizeof(*ctx));
    ctx->res = copy_res(res);
}
```
