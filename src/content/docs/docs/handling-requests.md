---
title: Handling Requests
description: A guide in my new Starlight docs site.
---

### Request Body

```sh
// src/handlers.c

#include "ecewo/router.h"

void print_body(Req *req, Res *res)
{
    printf("Body: %s\n", req->body);
    reply(res, "200 OK", "text/plain", "Success");
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo/router.h"

void print_body(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo/server.h"
#include "routes.h"
#include "handlers/handlers.h"

int main()
{
    post("/print-body", print_body);
    ecewo(3000);
    return 0;
}
```

Let's send a `POST` request to the `http://localhost:3000/print-body` with this body:

```
{
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

We'll receive a `Success` message and see the body in the terminal:

```
Body: {
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

More advanced usage is shown in [Using cJSON](/docs/using-cjson) section.

### Request Params

Let's take a specific user by params. We can access the params using the `get_req(&req->params, "params")` API. Let's write a handler that gives us the "slug":
But first, add `routes.h` the route:

```sh
// src/handlers.c

#include "ecewo/router.h"

void print_params(Req *req, Res *res)
{
    const char *slug = get_req(&req->params, "slug"); // We got the params

    if (slug == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing 'slug' parameter");
        return;
    }

    printf("Params: %s\n", slug);
    reply(res, "200 OK", "text/plain", slug);
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo/router.h"

void print_params(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo/server.h"
#include "ecewo/routes.h"
#include "handlers.h"

int main()
{
    get("/print-params/:slug", print_params);
    ecewo(3000);
    return 0;
}
```

Run the `make build` command in the terminal and send a request to `http://localhost:3000/print-params/testslug`. Server will send us `testslug`.

You can define more than one slug if you need using the same way. Here is an example:

```sh
// src/main.c

int main()
{
    get("/print-more-params/:key/and/:value");
    ecewo(3000);
    return 0;
}
```

```sh
// src/handlers.c

void print_more_params(Req *req, Res *res)
{
    const char *key = get_req(&req->params, "key");     // We got the /:key
    const char *value = get_req(&req->params, "value"); // We got the /:value

    if (key == NULL || value == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing 'key' or 'value' parameter");
        return;
    }

    printf("Key slug: %s Value slug: %s\n", key, value);

    reply(res, "200 OK", "text/plain", "Success!");
}
```

If we to `http://localhost:3000/print-more-params/foo/and/bar` address we'll receive a `Success!` response and see the `foo` and `bar` in the terminal:

```
Key slug: foo Value slug: bar
```

### Request Query

Like the `params`, we can use `get_req(&req->query, "query")` to get the query. Let's rewrite a handler using `query`: 

```sh
// src/main.c

// Create a route in the main function
get("/print-query", print_query);
```

```sh
// src/handlers.c

void print_query(Req *req, Res *res)
{
    const char *name = get_req(&req->query, "name");
    const char *surname = get_req(&req->query, "surname");

    if (name == NULL || surname == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing required parameter.");
        return;
    }

    printf("Name: %s Surname: %s\n", name, surname);

    reply(res, "200 OK", "text/plain", "Success!");
}
```

Let's recompile the program by running `make build` and send a request to `http://localhost:3000/print-query?name=john&surname=doe`. We'll receivea `Success!` output and there will be our query strings in the terminal:

```
Name: john Surname: doe
```

### Request Headers

As like as the `params` and `query`, we can reach also the headers of the request using `get_req(&req->headers, "header")` API.
ecewo also have some different APIs for authorization and authentication using sessions though, however, if you want to reach any item in the `req->headers`, you are able to do it.

Normally, a standard `GET` request with `POSTMAN` have some headers like:

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
// src/handlers.c

void print_user_agent(Req *req, Res *res)
{
    const char *header = get_req(&req->headers, "User-Agent");

    if (header == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing required parameter.");
        return;
    }

    printf("User Agent: %s\n", header);

    reply(res, "200 OK", "text/plain", "Success");
}
```

```sh
// src/handlers.h

void print_user_agent(Req *req, Res *res);
```

```sh
// src/main.c

get("/print-user-agent", print_user_agent);
```

The output will be `Success!` and there will be result in console:

```
    User Agent: PostmanRuntime/7.43.3
```
