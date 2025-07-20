---
title: Cookie
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo offers a `cookie.h` to get or set a cookie:
- [get_cookie()](/api/get_cookie/) to get the `Cookie` header
- [set_cookie()](/api/set_cookie/) to set a `Cookie` header.

The following `cookie_options_t` structure is required for `set_cookie()`.

```c
typedef struct
{
    int max_age;        // Default: -1
    char *path;         // Default: "/"
    char *same_site;    // Default: NULL
    bool http_only;     // Default: false
    bool secure;        // Default: false
} cookie_options_t;
```

Let's create three new routes. One for setting a cookie, one for getting the cookie, and one for getting all the cookies:

```c
// src/main.c

#include "server.h"
#include "handlers.h"

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();

    get("/set-cookie", set_cookie_handler);
    get("/get-cookie", get_cookie_handler);
    get("/all-cookies", get_all_cookies);

    shutdown_hook(destroy_app);
    ecewo(3000);
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
    cookie_options_t *options = {
        .max_age = 3600, // 1 hour
        .path = "/",
        .same_site = "Lax",
        .http_only = true,
        .secure = true,
    };

    set_cookie(res, "theme", "dark", &options);
    set_cookie(res, "name", "john", &options);
    send_text(res, 200, "Cookies sent!");
}

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

void get_all_cookies(Req *req, Res *res)
{
    const char *cookies = get_headers(req, "Cookie");

    if (!cookies)
    {
        send_text(res, 404, "No cookies found");
        return;
    }

    send_text(res, 200, cookies);
}
```

> **NOTE**
>
> The developer is responsible for freeing the memory of `get_cookie()`

When we send a request to `http://localhost:3000/set-cookie` via POSTMAN, we'll receive a `Cookies sent!` response. If we then check the `Cookies` tab, we'll see the two cookies that were sent.

Let's send a response to `http://localhost:3000/all-cookies` to check the cookies that were sent. When we send the request, the response we get should be `name=john; theme=dark`.

If we want to get a specific cookie only, we can use `get_cookie()` like shown in the example. Let's send another request to `http://localhost:3000/get-cookie`, and we'll get the response `dark`.
