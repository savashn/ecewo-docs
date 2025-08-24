---
title: send_text()
description: Minimalist and easy-to-use C web framework
---

`send_text()` is for sending `text/plain` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
static inline void send_text(Res *res, int status, const char *body)
{
    reply(res, status, "text/plain", body, strlen(body));
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    send_text(res, 200, "hello world!");
}
```