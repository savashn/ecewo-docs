---
title: set_cookie()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`set_cookie()` is a macro for setting the `Cookie` to the response headers.

```c
void set_cookie_handler(Req *req, Res *res)
{
    set_cookie("theme", "dark", 3600); // 1 hour
    send_text(res, 200, "Cookies sent!");
}
```