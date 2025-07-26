---
title: set_header()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
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