---
title: set_cookie()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`set_cookie()` is for setting the `Cookie` to the response headers. It takes four parameters: The `Res` object, the cookie name, the cookie value, and cookie options.

```c
typedef struct
{
    int max_age;        // Default: -1
    char *path;         // Default: "/"
    char *same_site;    // Default: NULL
    bool http_only;     // Default: false
    bool secure;        // Default: false
} cookie_options_t;

void set_cookie(Res *res, const char *name, const char *value, cookie_options_t *options);
```

Example usage with options:

```c
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
    send_text(res, 200, "Cookies sent!");
}
```

Example usage without options:

```c
void set_cookie_handler(Req *req, Res *res)
{
    set_cookie(res, "theme", "dark", NULL);
    send_text(res, 200, "Cookies sent!");
}
```

If there is no given options, the default values will be used.
