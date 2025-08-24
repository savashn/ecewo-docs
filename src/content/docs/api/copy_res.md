---
title: copy_res()
description: Minimalist and easy-to-use C web framework
---

`copy_res()` is using for deep copying the `Res` object. It is necessary especially for async operations.

```c
Res *copy_res(const Res *original);
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
    ctx->res = copy_res(res);
}
```
