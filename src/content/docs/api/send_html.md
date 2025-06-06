---
title: send_html()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`send_html()` is a macro for sending `text/html` responses easily. It runs [reply()](https://ecewo.vercel.app/api/reply) function under the hood.

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

    send_html(200, html);
}
```