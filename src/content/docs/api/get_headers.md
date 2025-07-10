---
title: get_headers()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_headers()` is for getting headers from request. It runs [get_req()](/api/get_req) function under the hood.

```c
static inline const char *get_query(const Req *req, const char *key)
{
    return get_req(&req->query, key);
}
```

Example usage:

```c
#include "ecewo.h"

void get_all_cookies(Req *req, Res *res)
{
    const char *cookies = get_headers("Cookie");

    if (!cookies)
    {
        send_text(res, 404, "No cookies found");
        return;
    }

    send_text(res, 200, cookies);
}
```
