---
title: Middleware
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo provides a middleware feauture, which looks like Express.js. Let's see how they work.

## Route Specific Middleware

Let's say we have two handlers, one for users and one for admin.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void home_handler(Req *req, Res *res);
void users_handler(Req *req, Res *res);
void admin_handler(Req *req, Res *res);

#endif
```

```c
// src/handlers.c

#include "handlers.h"

void home_handler(Req *req, Res *res)
{
    send_text(200, "Hello world!");
}

void users_handler(Req *req, Res *res)
{
    send_text(200, "User lists");
}

void admin_handler(Req *req, Res *res)
{
    send_text(200, "Welcome to admin panel");
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

int main()
{
    init_router();
    get("/", home_handler); // Works without middleware
    get("/user", use(auth), users_handler);  // Runs auth middleware first, then the handler
    get("/admin", use(auth, admin), admin_handler);  // Runs auth, then admin middleware, then the handler

    ecewo(4000);  // Start the server on port 4000
    reset_middleware();    // Free allocated middleware memory
    reset_router();
    return 0;
}
```

## Global Middleware

We have `hook()` API to define global middlewares. Let's implement a `logger` in `middlewares.c` apply it before every handler.

```c
// src/middlewares.h

#ifndef MIDDLEWARES_H
#define MIDDLEWARES_H

#include "ecewo.h"

int logger(Req *req, Res *res, Chain *chain);

#endif
```

```c
// src/middlewares.c

#include "middlewares.h"

int logger(Req *req, Res *res, Chain *chain)
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

int main()
{
    init_router();
    
    hook(simple_logger); // Runs for all routes, before handlers

    get("/", home_handler);
    get("/user", use(auth), users_handler);
    get("/admin", use(auth, admin), admin_handler);

    ecewo(3000);

    reset_middleware();
    reset_router();
    return 0;
}
```

## Passing Data

There is a specific way to pass the data along the middleware chain: `get_context()` and `set_context()`. We can pass the data to the next middleware or to the handler thanks to them. Let's make an example with [authentication via sessions](/examples/auth/#sessions).

We'll do two things:
- First, we'll check if the user is authenticated. If they are not, we'll send an error and exit the chain.
- Secondly, we'll check if the user is admin. According to this, we'll send different responses.

Let's figure out that we have a login handler like the following one:

```c
// src/login.c

#include "ecewo.h"
#include "session.h"
#include "cJSON.h"

void handle_login(Req *req, Res *res)
{
    cJSON *json = cJSON_Parse(body);
    if (!json)
    {
        send_text(400, "Invalid JSON");
        return;
    }

    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
    const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

    if (!username || !password)
    {
        cJSON_Delete(json);
        send_text(400, "Missing fields");
        return;
    }

    // Create session
    Session *sess = create_session(3600);

    // Add username info to the session_data
    set_session(sess, "username", username);

    // Mark as admin by adding an extra field if the user is John Doe
    if (strcmp(username, "johndoe"))
    {
        set_session(sess, "is_admin", "true");
    }

    // Send the session and response
    send_session(res, sess);
    send_text(200, "Login successful");
}
```

This is a basic login handler. If the user is "John Doe", it sends an extra "is_admin=true" field to the session data. Let's write our example considering this login handler.

First of all, we need to create a context structure to pass the data. In this example, all we need is the session data, which is a JSON object.

```c
// src/context.h

#ifndef CONTEXT_H
#define CONTEXT_H

#include "cJSON.h"

typedef struct {
    cJSON *session_json;
} session_context_t;

#endif
```

And we need to write a cleanup function to free the memory automatically that allocated by the context when we are done with the handler.

```c
// src/context.c

#include "context.h"
#include <stdlib.h>

void cleanup_session_ctx(void *data) {
    session_context_t *ctx = data;
    cJSON_Delete(ctx->session_json);
    free(ctx);
}
```

Let's begin to write the middleware, which is going to check if the user has authenticated. If the user has not authenticated, it will break the chain and send a response to the client immediately. Otherwise, it's going to set the context of the session to the `Req` object.

```c
// src/middlewares.c

#include "middlewares.h"
#include "session.h"
#include "cJSON.h"
#include "context.h"

int is_auth(Req *req, Res *res, Chain *chain) {
    // Get the user session
    Session *user_session = get_session(&req->headers);

    // If user has not authenticated, break the chain
    if (!user_session)
    {
        send_text(401, "Unauthorized");
        return 0;
    }

    // Otherwise, pass the session daha to the context
    // Parse session JSON once (remember that session->data is a JSON object)
    cJSON *session_data = cJSON_Parse(user_session->data);

    if (!session_data) {
        send_text(500, "Error: Failed to parse session data");
        return 0;
    }

    // Allocate context and attach
    session_context_t *session_ctx = malloc(sizeof(session_context_t));

    if (!session_ctx) {
        cJSON_Delete(session_data);
        send_text(500, "Internal Server Error");
        return 0;
    }

    // Attach the sessin_json in the context with the user's session_data
    session_ctx->session_json = session_data;

    // Set the session to the Request Context
    // We pass the cleanup function
    // that we wrote in context.c file too,
    // because it will free the memory automatically
    set_context(req, session_ctx, sizeof(session_context_t), cleanup_session_ctx);

    // Continue to the next chain
    return next(chain, req, res);
}
```

Let's write a handler that sends different responses according to if the user is admin or not.

```c
// src/main.c

#include "server.h"
#include "ecewo.h"
#include "middlewares.h"

void dashboard(Req *req, Res *res)
{
    session_context_t *session_ctx = (session_context_t *)get_context(req);

    cJSON *session_data = session_ctx->session_json;

    const cJSON *j_username = cJSON_GetObjectItem(session_data, "username");
    const cJSON *j_is_admin = cJSON_GetObjectItem(session_data, "is_admin");

    const char *username = j_username->valuestring;
    int is_admin = 0;

    if (j_is_admin && cJSON_IsString(j_is_admin))
    {
        const char *is_admin_char = j_is_admin->valuestring;

        if (strstr(is_admin_char, "true"))
            is_admin = 1;
    }

    if (is_admin == 1)
    {
        return send_text(200, "Welcome, admin!");
    }
    else
    {
        return send_text(200, "Welcome, user!");
    }
}

int main()
{
    init_router();

    get("/dashboard", use(is_auth), dashboard);

    ecewo(3000);
    reset_middleware();
    reset_router();
}
```

If user is not authenticated, the m

There are 3 possible responses:
- 1. If the user is not authenticated, the middleware will send a `401 Unauthorized` response and break the chain. Handler is never going to work.
- 2. If the user is authenticated, but they are not admin, handler will send a `200 "Welcome, user!"` response.
- 3. If the admin user is authenticated, the handler will send a `200 "Welcome, admin!"` response.
