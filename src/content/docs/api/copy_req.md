---
title: copy_req()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`copy_req()` is using for deep copying the `Req` object. It is necessary especially for async operations.

```c
Req *copy_req(const Req *original);
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
}
```
