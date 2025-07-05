---
title: set_header()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`set_cookie()` is for setting a custom header to the response headers.

```c
void hello_world(Req *req, Res *res)
{
    set_header(res, "X-Custom", "value");
    send_text(res, 200, "hello world");
}
```