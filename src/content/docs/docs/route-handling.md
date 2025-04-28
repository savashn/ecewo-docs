---
title: Route Handling
description: A guide in my new Starlight docs site.
---

We successfully ran our server in the previous chapter. Now we can start to receive requests and send responses.

## Handlers

Let's begin with classics; writing a `hello world` handler. First, create a `handlers.c` and `handlers.h` files in the `src/` directory:

```sh
// src/handlers.c

#include "ecewo/router.h"

void hello_world(Req *req, Res *res)
{
    reply(res, "200 OK", "text/plain", "hello world!");
}
```

We include `"ecewo/router.h"` to handle requests using `Req` and `Res`, and send a response via `reply()`.
We will see thee request handling more detailed in the next chapter.

When we are done with the handler, we should send a response to the client via `reply()` function. Basically, it takes 4 parameters:
- The `res` object,
- Status code,
- Content-type,
- Response body

We must declare this handler function in a `.h` file. Luckly, we have created a `handlers.h` together with `handlers.c` file.

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo/router.h"

void hello_world(Req *req, Res *res);

#endif
```

We declared our handler function but we are not done yet. We need to add `handlers.c` file to the `SRC` list to make it compile, just like we did in the previous chapter. See the [Makefile](/docs/installation#src).

```
SRC = \
    ecewo/server.c \
    ecewo/router.c \
    ecewo/routes.c \
    ecewo/request.c \
    ecewo/lib/session.c \
    ecewo/lib/cjson.c \
    src/main.c \        # We added this in the previous chapter
    src/handlers.c \    # We added it now
```

Now we can write the router, which will run our `hello_world` handler when a request is received.

## Declaring Routes

We can create our routers with `get()`, `post()`, `put()` and `del()` methods. Let's update our `main.c` file like this:

```sh
// src/main.c

#include "ecewo/server.h"   // This is for starting server
#include "ecewo/routes.h"   // This is for routing
#include "handlers.h"       // This is our handlers

int main()
{
    get("/", hello_world); // "GET" router for hello_world handler

    ecewo(3000);        // Start server
    return 0;           // Exit main function
}
```

`get()`, `post()`, `put()` and `del()` takes two params. First one is the path and the second one is the handler.

Now we can run the `make build` command in the terminal and go to the `http://localhost:3000/` again. We'll receive this:

```
hello world!
```

Congratulations! You have wrote your first route with ecewo!

## Notes

<--- **NOTE 1** --->

We have to use our routes in the same file where we start the server.
In our example, it is `main.c` file.

<br/>

<--- **NOTE 2** --->

We have to use double quots `""` to define the route path every time. If you accidentally write single quots `''`, you'll get an error.

```
get("/", hello_world); // CORRECT
get('/', hello_world); // INCORRECT
```

<br/>

<--- **NOTE 3** --->

`router.h` and `routes.h` are different headers and they serve different purposes:

- `router.h` is used for writing handlers; it provides `Req`, `Res` and `reply()`.
- `routes.h` is used for defining routes; it provides `get()`, `post()`, `put()` and `del()` routers.

