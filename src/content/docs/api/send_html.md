---
title: send_html()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`send_html()` is for sending `text/html` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
static inline void send_html(Res *res, int status, const char *body)
{
    reply(res, status, "text/html", body, strlen(body));
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    const char *html =
        "<!DOCTYPE html>"
        "<html lang=\"en\">"
        "<head><meta charset=\"UTF-8\"><title>Hello</title></head>"
        "<body><h1>Hello, world!</h1></body>"
        "</html>";

    send_html(res, 200, html);
}
```