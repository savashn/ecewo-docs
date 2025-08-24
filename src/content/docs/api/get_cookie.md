---
title: get_cookie()
description: Minimalist and easy-to-use C web framework
---

`get_cookie()` is for getting the `Cookie` from request headers. It takes two parameters: The `Req` object and a Cookie name.

```c
char *get_cookie(Req *req, const char *name);
```

```c
#include "ecewo.h"

void get_cookie_handler(Req *req, Res *res)
{
  char *theme = get_cookie(req, "theme");

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
