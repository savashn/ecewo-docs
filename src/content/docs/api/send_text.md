---
title: send_text()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`send_text()` is a macro for sending `text/plain` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    send_text(res, 200, "hello world!");
}
```