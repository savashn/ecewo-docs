---
title: Defining Routes
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We can create our routes with these functions:

- [get()](/api/get/) for `GET` routes,
- [post()](/api/post/) for `POST` routes,
- [put()](/api/put/) for `PUT` routes,
- [patch()](/api/patch/) for `PATCH` routes,
- [del()](/api/del/) for `DELETE` routes.

If they don't have any middleware, they take 2 parameters: First one is the path and second one is the handler.

They must be defined in the entry point, which is the `int main(void)` function in the `main.c` file. But we must call the `init_router()` before we register the routes and call `reset_router()` in the server cleanup function to free their memory. So an example `main.c` file should be like this:

```c
// main.c

#include "server.h"
#include "our_handlers.h"

void destroy_app(void) {
    reset_router();
}

int main(void) {
    init_router();

    del("/delete", delete_handler);
    put("/update", update_handler);
    patch("/edit", edit_handler)
    post("/create", create_handler);
    get("/", get_handler);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

We also can define our routes in another file and call of them in main function. Let's make an example:

```c
// routes.c

#include "our_handlers.h"

void register_our_routes(void)
{
    del("/delete", delete_handler);
    patch("/edit", edit_handler)
    put("/update", update_handler);
    post("/create", create_handler);
    get("/", get_handler);
}
```

And declare this function in a header file:

```c
// routes.h

#ifndef OUR_ROUTES_H
#define OUR_ROUTES_H

void register_our_routes(void);

#endif
```

Let's call it in main function:

```c
#include "server.h"
#include "our_routes.h"

void destroy_app(void) {
    reset_router();
}

int main(void) {
    init_router();

    register_our_routes();

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

<br />
<hr />
<br />

> **NOTE**
> 
> Routes might take more than 2 parameters via `use()` if we use middlewares. Middlewares are explained in [Middleware](/docs/middleware) chapter.
