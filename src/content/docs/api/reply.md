---
title: reply()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`reply()` is the main response function. It takes four parameters:

- Status code
- Content Type
- Response body
- Response body length

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *response = "hello world!"
    reply(200, "text/plain", response, strlen(response));
}
```

You might want to use `send_` macros instead.