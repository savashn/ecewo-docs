---
title: reply()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`reply()` is the main response function.

```c
void reply(Res *res, int status, const char *content_type, const void *body, size_t body_len);
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *response = "hello world!"
    reply(res, 200, "text/plain", response, strlen(response));
}
```

You can use this function for responses that are not suitable for `send_text()`, `send_html()`, `send_json()`, `send_cbor()` functions.
