---
title: Cookie
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo offers a `cookie` API to get or set a cookie:
- `get_cookie()` to get the `Cookie` header
- `set_cookie()` to set a `Cookie` header.

Let's create three new routes. One for setting a cookie, one for getting the cookie, and one for getting all the cookies:

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();

    get("/set-cookie", set_cookie_handler);
    get("/get-cookie", get_cookie_handler);
    get("/all-cookies", get_all_cookies);

    ecewo(3000);
    reset_router();
    return 0;
}
```

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void set_cookie_handler(Req *req, Res *res);
void get_cookie_handler(Req *req, Res *res);
void get_all_cookies(Req *req, Res *res);

#endif
```

```c
// src/handlers.c

#include "handlers.h"
#include "cookie.h"

void set_cookie_handler(Req *req, Res *res)
{
    set_cookie("theme", "dark", 3600); // 1 hour
    set_cookie("name", "john", 7200);  // 2 hour
    send_text(200, "Cookies sent!");
}

void get_cookie_handler(Req *req, Res *res)
{
    char *theme = get_cookie("theme");

    if (!theme)
    {
        send_text(404, "Cookies not found");
        return;
    }

    send_text(200, theme);
    free(theme);
}

void get_all_cookies(Req *req, Res *res)
{
    const char *cookies = get_headers("Cookie");

    if (!cookies)
    {
        send_text(404, "No cookies found");
        return;
    }

    send_text(200, cookies);
}
```

`get_cookie()` actually runs [get_headers()](/docs/handling-requests#request-headers) under the hood, and it searchs the `Cookie` header only. Remember, you have to free its memory after you use.

When we send a request to `http://localhost:3000/set-cookie` via POSTMAN, we'll receive a `Cookies sent!` response. If we then check the `Cookies` tab, we'll see the two cookies that were sent.

Let's send a response to `http://localhost:3000/all-cookies` to check the cookies that were sent. When we send the request, the response we get should be `name=john; theme=dark`.

If we want to get a specific cookie only, we can use `get_cookie()` like shown in the example. Let's send another request to `http://localhost:3000/get-cookie`, and we'll get the response `dark`.
