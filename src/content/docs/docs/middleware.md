---
title: Middleware
description: Documentation of Ecewo — A modern microframework for web development in C
---

Ecewo provides a middleware feauture, which looks like Express.js. Let's see how they work.

## Route Specific Middleware

Let's say we have two handlers, one for users and one for admin.

```sh
// src/handlers.c

#include "router.h"

void home_handler(Req *req, Res *res)
{
    reply(res, "200 OK", "text/plain", "Hello world!");
}

void users_handler(Req *req, Res *res)
{
    reply(res, "200 OK", "text/plain", "User lists");
}

void admin_handler(Req *req, Res *res)
{
    reply(res, "200 OK", "text/plain", "Welcome to admin panel");
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void home_handler(Req *req, Res *res);
void users_handler(Req *req, Res *res);
void admin_handler(Req *req, Res *res);

#endif
```

Now let's write two middlewares for those handlers.

```sh
// src/middlewares.h

#ifndef MIDDLEWARES_H
#define MIDDLEWARES_H

#include "router.h"

int auth(Req *req, Res *res, Chain *chain);
int admin(Req *req, Res *res, Chain *chain);

#endif
```

```sh
// src/middlewares.c

#include "router.h"

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

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers.h"
#include "middlewares.h"

int main()
{
    get("/", home_handler); // Works without middleware
    get("/user", use(auth), users_handler);  // Runs auth middleware first, then the handler
    get("/admin", use(auth, admin), admin_handler);  // Runs auth, then admin middleware, then the handler

    ecewo(4000);  // Start the server on port 4000
    free_mw();    // Free allocated middleware memory
    return 0;
}
```

## Global Middleware

We have `hook()` API to define global middlewares. Let's implement a `logger` in `middlewares.c` apply it before every handler.

```sh
// src/middlewares.c

#include "router.h"

int logger(Req *req, Res *res, Chain *chain)
{
    printf("Request received: %s %s\n", req->method, req->path);
    return next(chain, req, res);
}
```

```sh
// src/middlewares.h

#ifndef MIDDLEWARES_H
#define MIDDLEWARES_H

#include "router.h"

int logger(Req *req, Res *res, Chain *chain);

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers.h"
#include "middlewares.h"

int main()
{
    hook(simple_logger); // Runs for all routes, before handlers

    get("/", home_handler);
    get("/user", use(auth), users_handler);
    get("/admin", use(auth, admin), admin_handler);

    ecewo(3000);
    free_mw();
    return 0;
}
```
