---
title: get_query()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_query()` is for getting query string from request. It runs [get_req()](/api/get_req) function under the hood.

```c
static inline const char *get_query(const Req *req, const char *key)
{
    return get_req(&req->query, key);
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *name = get_query("name");
}
```
