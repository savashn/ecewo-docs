---
title: Handling Requests
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We can easily access the request's `body`, `params`, `query`, and `headers`. We'll see just basic examples in this chapter.

Let's see how it basically works.

## Request Body

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_body(Req *req, Res *res)
{
    printf("Body: %s\n", req->body);
    send_text(res, 200, "Success!");
}

int main()
{
    init_router();
    post("/print-body", print_body);
    ecewo(3000);
    reset_router();
    return 0;
}
```

Let's send a `POST` request to the `http://localhost:3000/print-body` with this body:

```json
{
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

We'll receive a `Success` message and see the body in the console:

```json
Body: {
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

For more advanced usage; see [Using JSON](/docs/using-json) chapter.

## Request Params

Let's take a specific user by params. We can access the params using the `get_params("slug");` API. Let's write a handler that gives us the "slug":

```c
// main.c

#include "server.h"
#include "ecewo.h"

void send_params(Req *req, Res *res)
{
    const char *slug = get_params(req, "slug"); // We got the params

    if (slug == NULL)
    {
        send_text(res, 400, "Missing 'slug' parameter");
        return;
    }

    send_text(res, 200, slug);
}

int main()
{
    init_router();
    get("/send-params/:slug", send_params);
    ecewo(3000);
    reset_router();
    return 0;
}
```

Recompile the program and send a request to `http://localhost:3000/send-params/testslug`. Server will send us `testslug` response.

We can define more than one slug if we need using the same way. Here is an example:

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_more_params(Req *req, Res *res)
{
    const char *key = get_params(req, "key");      // We got the /:key
    const char *value = get_params(req, "value");  // We got the /:value

    if (key == NULL || value == NULL)
    {
        send_text(res, 400, "Missing 'key' or 'value' parameter");
        return;
    }

    printf("Key slug: %s Value slug: %s\n", key, value);

    send_text(res, 200, "Success!");
}

int main()
{
    init_router();
    get("/print-more-params/:key/and/:value");
    ecewo(3000);
    reset_router();
    return 0;
}
```

If we go to `http://localhost:3000/print-more-params/foo/and/bar` path, we'll receive a `Success!` response and see the `foo` and `bar` in the console:

```
Key slug: foo Value slug: bar
```

## Request Query

Just like the `params`, we can use `get_query("query");` to get the query params. Let's rewrite a handler using `query`: 

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_query(Req *req, Res *res)
{
    const char *name = get_query(req, "name");
    const char *surname = get_query(req, "surname");

    if (name == NULL || surname == NULL)
    {
        send_text(res, 400, "Missing required parameter.");
        return;
    }

    printf("Name: %s Surname: %s\n", name, surname);

    send_text(res, 200, "Success!");
}

int main()
{
    init_router();
    get("/print-query", print_query);
    ecewo(3000);
    reset_router();
    return 0;
}
```

Let's recompile the program and send a request to `http://localhost:3000/print-query?name=john&surname=doe`. We'll receive a `Success!` responseand the query strings will be printed in the console:

```
Name: john Surname: doe
```

## Request Headers

Just like `params` and `query`, we can also access request headers using the `get_headers("header");` API.
Ecewo also provides different APIs for authorization and session-based authentication.
However, if you simply want to access a specific item in `req->headers`, you can do so directly.

Typically, a standard `GET` request with `POSTMAN` have some headers like:

```json
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

```c
// main.c

#include "server.h"
#include "ecewo.h"

void get_user_agent(Req *req, Res *res)
{
    const char *user_agent = get_headers(req, "User-Agent");

    if (user_agent == NULL)
    {
        send_text(res, 400, "Missing required parameter.");
        return;
    }

    send_text(res, 200, user_agent);
}

int main()
{
    init_router();
    get("/header", get_user_agent);
    ecewo(3000);
    reset_router();
    return 0;
}
```

The result will be something like this:

```
    User Agent: PostmanRuntime/7.43.3
```
