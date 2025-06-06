---
title: get_headers()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_headers()` is a macro for getting headers from request. It runs [get_req()](https://ecewo.vercel.app/api/get_req) function under the hood.

```c
#include "ecewo.h"

void get_all_cookies(Req *req, Res *res)
{
    const char *cookies = get_headers("Cookie");

    if (!cookies)
    {
        send_text(404, "No cookies found");
        return;
    }

    send_text(200, cookies);
}
```
