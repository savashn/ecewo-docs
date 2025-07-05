---
title: Getting Started
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

## Requirements

- A C compiler (GCC, Clang, or MSVC)
- CMake version 3.14 or higher

## Quick Start

Create a project with Ecewo:

```cmake
# CMakeLists.txt

cmake_minimum_required(VERSION 3.14)
project(your_project VERSION 1.0.0 LANGUAGES C)

include(FetchContent)

# Fetch Ecewo from GitHub
FetchContent_Declare(
    ecewo
    GIT_REPOSITORY https://github.com/savashn/ecewo.git
    GIT_TAG main
)

# Make Ecewo available
FetchContent_MakeAvailable(ecewo)

# Create the executable
add_executable(server
    main.c
)

# Link Ecewo
target_link_libraries(server PRIVATE ecewo)
```

```c
// main.c

#include "server.h"    // To start the server via ecewo();
#include "ecewo.h"     // Our main API

void hello_world(Req *req, Res *res) {
    send_text(res, 200, "Hello, World!");
}

int main() {
    init_router();
    get("/", hello_world);
    ecewo(3000);
    reset_router();
    return 0;
}
```

This is defining handler. We include `"ecewo.h"` header, which is the main module of our project. It provides many of various HTTP tools —such as `Req`, `Res`, `send` and many others— used for writing handlers and routers.

And this is our handler. We get the request via `Req *req` that we'll see more detailed in the next chapter. `Res *res` is our response header, we send it in every response. And `send_text()` is a macro for sending `text/plain` responses to the client.

When we are done with the handler, we need to send a response to the client using one of the following functions:
- [send_text()](/api/send_text/) is for `text/plain` responses,
- [send_html()](/api/send_html/) is for `html/plain` responses,
- [send_json()](/api/send_json/) is for `application/json` responses,
- [send_cbor()](/api/send_cbor/) is for `application/cbor` responses.

Basically, they take 3 parameters: the response object, a status code and a response body — except for `send_cbor()`, which takes four: the response object, a status code, a response body, and the length of the response body.

The `server.h` header provides the `ecewo()` function that starts the server. `ecewo()` takes a `PORT` parameter of type `unsigned short`.

We can create our routers with these methods:

- [get()](/api/get/)
- [post()](/api/post/)
- [put()](/api/put/)
- [del()](/api/del/)

They takes two parameters: First one is the path and second one is the handler.

> **NOTE:**
>
> We have to define our routes in the entry point, which is `main.c`. For modularity, we can define them outside and call in the `int main()` function.

> **NOTE:**
>
>  We have to use double quots `""` to define the route path every time. If we accidentally write single quots `''`, we'll get an error.

```
get("/", hello_world); // CORRECT
get('/', hello_world); // INCORRECT
```

Now we can run the following commands in the terminal to build our server:

```shell
mkdir build && cd build && cmake .. && cmake --build .
```

Let's run it:
```shell
// Linux/macOS:
./server

// Windows
./server.exe
```

When we ran the suitable command; we’ll see following informations if our server is ready:

```
Ecewo [version]
Server is running at: http://localhost:3000
```

Now if we go to `http://localhost:3000/` we'll see a basic `hello world!` text message.
