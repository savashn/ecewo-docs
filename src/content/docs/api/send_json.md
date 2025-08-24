---
title: send_json()
description: Minimalist and easy-to-use C web framework
---

`send_json()` is for sending `application/json` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
static inline void send_json(Res *res, int status, const char *body)
{
    reply(res, status, "application/json", body, strlen(body));
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    send_json(res, 200, "{ \"message\": \"hello world!\" }");
}
```
