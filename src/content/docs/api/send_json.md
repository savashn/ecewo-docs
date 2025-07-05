---
title: send_json()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`send_json()` is a macro for sending `application/json` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    send_json(res, 200, "{ \"message\": \"hello world!\" }");
}
```

You can generate and parse JSON objects via built-in `cJSON`. See [Using JSON](/examples/using-json/) chapter.