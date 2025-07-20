---
title: Middleware
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo provides a middleware feature, which looks like Express.js. Let's see how they work.

## Route Specific Middleware

Let's say we have two handlers, one for users and one for admin.

Let's write 3 different middlewares:
- One of them will be the mainpage handler, which runs without middleware and is **accessible for everyone**.
- One of them will be **accessible only for users**.
- And one of them will be **accessible only for admin**.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void home_handler(Req *req, Res *res);  // Accessible for everyone
void users_handler(Req *req, Res *res); // Accessible for users
void admin_handler(Req *req, Res *res); // Accessible for admin

#endif
```

```c
// src/handlers.c

#include "handlers.h"

void home_handler(Req *req, Res *res)
{
    send_text(res, 200, "Hello world!");
}

void users_handler(Req *req, Res *res)
{
    send_text(res, 200, "User lists");
}

void admin_handler(Req *req, Res *res)
{
    send_text(res, 200, "Welcome to admin panel");
}
```

Now let's write two middlewares for those handlers.

```c
// src/middlewares.h

#ifndef MIDDLEWARES_H
#define MIDDLEWARES_H

#include "ecewo.h"

int auth(Req *req, Res *res, Chain *chain);
int admin(Req *req, Res *res, Chain *chain);

#endif
```

```c
// src/middlewares.c

#include "middlewares.h"

int auth(Req *req, Res *res, Chain *chain)
{
    printf("Authentication middleware is working...\n");
    return next(chain, req, res);
}

int admin(Req *req, Res *res, Chain *chain)
{
    printf("Middleware for admin is working...\n");
    return next(chain, req, res);
}
```

At the end of a middleware, you must call `next()` —just like in Express.js— to proceed to the handler.

We have a `use()` macro to call the middleware before the handler.

```c
// src/main.c

#include "server.h"
#include "handlers.h"
#include "middlewares.h"

void destroy_app()
{
    reset_middleware(); // Free the allocated middleware memory before the router
    reset_router();
}

int main()
{
    init_router();
    get("/", home_handler); // Works without middleware
    get("/user", use(auth), users_handler);  // Runs auth middleware first, then the handler
    get("/admin", use(auth, admin), admin_handler);  // Runs auth, then admin middleware, then the handler

    shutdown_hook(destroy_app);
    ecewo(3000);  // Start the server on port 3000
    return 0;
}
```

## Global Middleware

We have `hook()` function to define global middlewares. Let's implement a simple `logger` in `middlewares.c` and apply it before every handler.

```c
// src/middlewares.h

#ifndef MIDDLEWARES_H
#define MIDDLEWARES_H

#include "ecewo.h"

int simple_logger(Req *req, Res *res, Chain *chain);

#endif
```

```c
// src/middlewares.c

#include "middlewares.h"

int simple_logger(Req *req, Res *res, Chain *chain)
{
    printf("Request received: %s %s\n", req->method, req->path);
    return next(chain, req, res);
}
```

```c
// src/main.c

#include "server.h"
#include "handlers.h"
#include "middlewares.h"

void destroy_app()
{
    reset_middleware();
    reset_router();
}

int main()
{
    init_router();
    
    hook(simple_logger); // Runs for all routes, before handlers

    get("/", home_handler);
    get("/user", use(auth), users_handler);
    get("/admin", use(auth, admin), admin_handler);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

## Passing Data

There is a specific way to pass the data along the middleware chain: `get_context()` and `set_context()` macros. We can pass the data to the next middleware or to the handler using them.

Let's make an example. We'll get a `name`, `surname`, and `age` in the middleware from the request query, and pass them to the handler. First, we need to create a context that will be shared between the middleware chain:

```c
// context.h

#ifndef CONTEXT_H
#define CONTEXT_H

typedef struct
{
    char *name;
    char *surname;
    int age;
} context_t;

void cleanup_context(void *data);

#endif
```

Because we need to free the memory that allocated by context, we have to write a cleanup function, which is `cleanup_context()` in this example.

```c
// context.c

#include "context.h"
#include <stdlib.h>

void cleanup_context(void *data)
{
    context_t *ctx = (context_t *)data;

    if (ctx->name)
        free(ctx->name);
    if (ctx->surname)
        free(ctx->surname);

    free(ctx);
}
```

Now, let's write our middleware and handler:

```c
// main.c

#include "server.h"
#include "ecewo.h"
#include "context.h"

// Get the required items in the middleware
int welcome_middleware(Req *req, Res *res, Chain *chain)
{
    // Always allocate a context, even if no data
    context_t *ctx = calloc(1, sizeof(context_t));
    if (!ctx)
    {
        send_text(res, 500, "Internal Server Error");
        return 0;
    }

    // Get the query
    const char *name = get_query(req, "name");
    const char *surname = get_query(req, "surname");
    const char *age_str = get_query(req, "age");

    // Attach the queries with context
    ctx->name = name ? strdup(name) : NULL;
    ctx->surname = surname ? strdup(surname) : NULL;
    ctx->age = age_str ? atoi(age_str) : 0;

    // Set the data to the context
    set_context(req, ctx, sizeof(*ctx), cleanup_context);

    /*
    We pass the cleanup function (defined in context.c)
    to set_context so that it can automatically free the memory
    */

    return next(chain, req, res);
}

void welcome_handler(Req *req, Res *res)
{
    context_t *ctx = (context_t *)get_context(req);

    const char *name = ctx->name;
    const char *surname = ctx->surname;
    int age = ctx->age;

    char response[255];
    sprintf(response, "Welcome, %s %s, %d", name, surname, age);

    send_text(res, 200, response);
}


void destroy_app()
{
    reset_middleware();
    reset_router();
}

int main()
{
    init_router();
    
    get("/welcome", use(welcome_middleware), welcome_handler);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's send a response to `http://localhost:3000/welcome?name=Jane&surname=Doe&age=24`, we'll receive that response:

```
Welcome, Jane Doe, 24
```
