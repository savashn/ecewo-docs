---
title: get_params()
description: Minimalist and easy-to-use C web framework
---

`get_params()` is for getting params from request. It runs [get_req()](api/get_req) function under the hood.

```c
static inline const char *get_params(const Req *req, const char *key)
{
    return get_req(&req->params, key);
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *slug = get_params("slug");
}
```
