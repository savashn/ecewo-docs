---
title: get_req()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_req()` is the main function to get the parts of request.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    // It might be also &req->query or &req->headers
    const char *params = get_req(&req->params, "slug");
}
```

It's much more easy to use `get_params()`, `get_query()` and `get_headers` macros instead.