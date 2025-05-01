---
title: Route Handling
description: Documentation of ecewo - A minimal HTTP framework for C.
---

We successfully ran our server in the previous chapter. Now we can start to receive requests and send responses.

## Handlers

Let's begin with classics; writing a `hello world` handler. First, create a `handlers.c` and `handlers.h` files in the `src/` directory:

```sh
// src/handlers.c

#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    reply(res, "200 OK", "text/plain", "hello world!");
}
```

We include `"ecewo.h"` header, which is the main module of our project. It provides various HTTP tools — such as `Req`, `Res` and `reply()` — used for writing handlers and routers.

We get the request via `Req *req` that we'll see more detailed in the next chapter. `Res *res` is our response header, we send it in every response. And `reply()` is using for sending a response to the client.

When we are done with the handler, we should send a response to the client via `reply()` function. Basically, it takes 4 parameters:
- The `res` parameter,
- Status code,
- Content-Type,
- Response body

Now we must declare this handler function in a `.h` file —  just like we always do when writing in C. We already created a `handlers.h` along with `handlers.c` file.

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void hello_world(Req *req, Res *res);

#endif
```

We declared our handler function but we are not done yet. We need to add `handlers.c` file to our `CMakeLists.txt` to compile it.

```
// src/CMakeLists.txt

cmake_minimum_required(VERSION 3.10)
project(your-project VERSION 0.1.0 LANGUAGES C)

set(APP_SRC
    ${CMAKE_CURRENT_SOURCE_DIR}/main.c
    ${CMAKE_CURRENT_SOURCE_DIR}/handlers.c # WE ADDED OUR HANDLERS
    PARENT_SCOPE
)
```

Now we can write the router, which will run our `hello_world` handler when a request is received.

## Declaring Routes

We can create our routers with `get()`, `post()`, `put()` and `del()` methods. Let's update our `main.c` file like this:

```sh
// src/main.c

#include "server.h"     // This is for starting server
#include "ecewo.h"      // This is for routing
#include "handlers.h"   // This is our handlers

int main()
{
    get("/", hello_world); // "GET" router for hello_world handler

    ecewo();    // Start server
    return 0;   // Exit main function
}
```

`get()`, `post()`, `put()` and `del()` takes two parameters. First one is the path and second one is the handler.

Now we can recompile our program and go to `http://localhost:8080/` again. We'll receive this:

```
hello world!
```

So simple.

## Notes

<--- **NOTE 1** --->

We have to define our routes in the entry point, which is `main.c`. For modularity, we can define them outside and call in the `int main()` function.

<br/>

<--- **NOTE 2** --->

We have to use double quots `""` to define the route path every time. If we accidentally write single quots `''`, we'll get an error.

```
get("/", hello_world); // CORRECT
get('/', hello_world); // INCORRECT
```
