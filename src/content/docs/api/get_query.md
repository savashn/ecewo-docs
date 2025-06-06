---
title: get_query()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_query()` is a macro for getting query string from request. It runs [get_req()](https://ecewo.vercel.app/api/get_req) function under the hood.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *name = get_query("name");
}
```
