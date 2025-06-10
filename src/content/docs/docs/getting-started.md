---
title: Getting Started
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

## Requirements

- A C compiler (GCC, Clang, or MSVC)
- CMake version 3.10 or higher

## Installation

Add Ecewo into your `CMakeLists.txt`:
```cmake
include(FetchContent)

FetchContent_Declare(
    ecewo
    GIT_REPOSITORY https://github.com/savashn/ecewo.git
    GIT_TAG main
)

FetchContent_MakeAvailable(ecewo)
```

And link Ecewo:
```cmake
target_link_libraries(your_project PRIVATE ecewo)
```

Build:
```shell
mkdir build && cd build
cmake .. && cmake --build .
```

## Example "Hello World"

To get started, create a "Hello World" application with this directory structure:

```
your_project/
├── CMakeLists.txt
└── src/ 
    ├── main.c
    ├── handlers.c
    └── handlers.h
```

```cmake
// CMakeLists.txt

cmake_minimum_required(VERSION 3.10)
project(your_project VERSION 1.0.0 LANGUAGES C)

include(FetchContent)

# Fetch Ecewo from GitHub
FetchContent_Declare(
    ecewo
    GIT_REPOSITORY https://github.com/savashn/ecewo-nightly.git
    GIT_TAG main
)

FetchContent_MakeAvailable(ecewo)

# Create our executable
add_executable(server
    src/main.c
    src/handlers.c
)

# Link Ecewo
target_link_libraries(server PRIVATE ecewo)

target_include_directories(server PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)
```

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"  // Our main API

void hello_world(Req *req, Res *res);

#endif
```

This is defining handler. We include `"ecewo.h"` header, which is the main module of our project. It provides many of various HTTP tools —such as `Req`, `Res`, `send` and many others— used for writing handlers and routers.

```c
// src/handlers.c

#include "handlers.h"

void hello_world(Req *req, Res *res)
{
    send_text(200, "Hello World!");
}
```

And this is our handler. We get the request via `Req *req` that we'll see more detailed in the next chapter. `Res *res` is our response header, we send it in every response. And `send_text()` is a macro for sending `text/plain` responses to the client.

When we are done with the handler, we need to send a response to the client using one of the following macros:
- [send_text()](/api/send_text/) is for `text/plain` responses,
- [send_html()](/api/send_html/) is for `html/plain` responses,
- [send_json()](/api/send_json/) is for `application/json` responses,
- [send_cbor()](/api/send_cbor/) is for `application/cbor` responses.

Basically, they take 2 parameters: a status code and a response body — except for `send_cbor()`, which takes three: a status code, a response body, and the length of the response body.

```c
// src/main.c

#include "server.h"   // To start the server
#include "handlers.h" // Our "hello_world()" handler declaration

int main()
{
  init_router();
  get("/", hello_world);
  ecewo(4000);
  reset_router();
  return 0;
}
```

And this is the entry point. The `server.h` header provides the `ecewo()` function that starts the server. `ecewo()` takes a `PORT` parameter of type `unsigned short`.

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
mkdir build && cd build
cmake .. && cmake --build .
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
Server is running at: http://localhost:4000
```

Now if we go to `http://localhost:4000/` we'll see a basic `hello world!` text message.
