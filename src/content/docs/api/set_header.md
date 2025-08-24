---
title: set_header()
description: Minimalist and easy-to-use C web framework
---

`set_header()` is for setting a custom header to the response headers.

```c
void set_header(Res *res, const char *name, const char *value);
```

Example usage:

```c
void hello_world(Req *req, Res *res)
{
    set_header(res, "X-Custom", "value");
    send_text(res, 200, "hello world");
}
```