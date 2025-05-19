---
title: Handling Requests
description: Documentation of Ecewo — A modern microframework for web development in C
---

We can easily access the request's `body`, `params`, `query`, and `headers` from `req`. We'll see just basic examples in this chapter.

Let's see how it basically works.

## Request Body

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void print_body(Req *req, Res *res);

#endif
```

```sh
// src/handlers.c

#include "handlers.h"

void print_body(Req *req, Res *res)
{
    printf("Body: %s\n", req->body);
    reply(res, 200, "text/plain", "Success");
}
```

```sh
// src/main.c

#include "server.h"
#include "handlers.h"   // "ecewo.h" already comes from here

int main()
{
    init_router();
    post("/print-body", print_body);
    ecewo(4000);
    final_router();
    return 0;
}
```

Let's send a `POST` request to the `http://localhost:4000/print-body` with this body:

```
{
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

We'll receive a `Success` message and see the body in the console:

```
Body: {
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

For more advanced usage; see [Using JSON](/docs/using-json) chapter.

## Request Params

Let's take a specific user by params. We can access the params using the `get_req(&req->params, "params")` API. Let's write a handler that gives us the "slug":

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void send_params(Req *req, Res *res);

#endif
```

```sh
// src/handlers.c

#include "handlers.h"

void send_params(Req *req, Res *res)
{
    const char *slug = get_req(&req->params, "slug"); // We got the params

    if (slug == NULL)
    {
        reply(res, 400, "text/plain", "Missing 'slug' parameter");
        return;
    }

    reply(res, 200, "text/plain", slug);
}
```

```sh
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/send-params/:slug", send_params);
    ecewo(4000);
    final_router();
    return 0;
}
```

Recompile the program and send a request to `http://localhost:4000/send-params/testslug`. Server will send us `testslug` response.

We can define more than one slug if we need using the same way. Here is an example:

```sh
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/print-more-params/:key/and/:value");
    ecewo(4000);
    final_router();
    return 0;
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void print_more_params(Req *req, Res *res);

#endif
```

```sh
// src/handlers.c

#include "handlers.h"

void print_more_params(Req *req, Res *res)
{
    const char *key = get_req(&req->params, "key");     // We got the /:key
    const char *value = get_req(&req->params, "value"); // We got the /:value

    if (key == NULL || value == NULL)
    {
        reply(res, 400, "text/plain", "Missing 'key' or 'value' parameter");
        return;
    }

    printf("Key slug: %s Value slug: %s\n", key, value);

    reply(res, 200, "text/plain", "Success!");
}
```

If we go to `http://localhost:4000/print-more-params/foo/and/bar` path, we'll receive a `Success!` response and see the `foo` and `bar` in the console:

```
Key slug: foo Value slug: bar
```

## Request Query

Like the `params`, we can use `get_req(&req->query, "query")` to get the query. Let's rewrite a handler using `query`: 

```sh
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/print-query", print_query);
    ecewo(4000);
    final_router();
    return 0;
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void print_query(Req *req, Res *res);

#endif
```

```sh
// src/handlers.c

#include "ecewo.h"

void print_query(Req *req, Res *res)
{
    const char *name = get_req(&req->query, "name");
    const char *surname = get_req(&req->query, "surname");

    if (name == NULL || surname == NULL)
    {
        reply(res, 400, "text/plain", "Missing required parameter.");
        return;
    }

    printf("Name: %s Surname: %s\n", name, surname);

    reply(res, 200, "text/plain", "Success!");
}
```

Let's recompile the program and send a request to `http://localhost:4000/print-query?name=john&surname=doe`. We'll receive a `Success!` responseand the query strings will be printed in the console:

```
Name: john Surname: doe
```

## Request Headers

Just like `params` and `query`, we can also access request headers using the `get_req(&req->headers, "header")` API.
Ecewo also provides different APIs for authorization and session-based authentication.
However, if you simply want to access a specific item in `req->headers`, you can do so directly.

Typically, a standard `GET` request with `POSTMAN` have some headers like:

```
{
    "User-Agent": "PostmanRuntime/7.43.3",
    "Accept": "*/*",
    "Postman-Token": "9b1c7dda-27f9-471a-9cdd-bfaf0d5b56a1",
    "Host": "localhost:3000",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
}
```

Let's say, we need the `User-Agent` header:

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void get_user_agent(Req *req, Res *res);

#endif
```


```sh
// src/handlers.c

#include "handlers.h"

void get_user_agent(Req *req, Res *res)
{
    const char *header = get_req(&req->headers, "User-Agent");

    if (header == NULL)
    {
        reply(res, 400, "text/plain", "Missing required parameter.");
        return;
    }

    reply(res, 200, "text/plain", header);
}
```

```sh
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/header", get_user_agent);
    ecewo(4000);
    final_router();
    return 0;
}
```

The result will be something like this:

```
    User Agent: PostmanRuntime/7.43.3
```
