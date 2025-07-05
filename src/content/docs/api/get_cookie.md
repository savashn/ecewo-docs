---
title: get_cookie()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get_cookie()` is a macro for getting the `Cookie` from request headers.

```c
#include "ecewo.h"

void get_cookie_handler(Req *req, Res *res)
{
  char *theme = get_cookie("theme");

  if (!theme)
  {
    send_text(res, 404, "Cookies not found");
    return;
  }

  send_text(res, 200, theme);
  free(theme);
}
```

The variable of `get_cookie()` has to be freed always.
