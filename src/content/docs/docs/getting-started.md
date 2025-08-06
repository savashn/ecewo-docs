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
   GIT_TAG main # alternatively, use a version tag like v1.0.0
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

#include "server.h"  // To start and end the server
#include "ecewo.h"   // To use the main API

// HTTP request handler for root endpoint
void hello_world(Req *req, Res *res) {
   send_text(res, 200, "Hello, World!");  // Send plain text response
}

// Cleanup function called during graceful shutdown
void destroy_app() {
   reset_router();  // Free router memory and routes
}

// Server entry point
int main() {
   init_router();               // Initialize HTTP router system
   get("/", hello_world);       // Register GET route for root path
   shutdown_hook(destroy_app);  // Register cleanup function for graceful shutdown
   ecewo(3000);                 // Start server on port 3000 (blocking call)
   return 0;                    // Program exits after server shutdown
}
```

We include two header files: `server.h` and `ecewo.h`. Let's explain this code step by step:

- The `server.h` header provides the `ecewo()` function that starts the server, and `shutdown_hook()` function to free the memory of server. So we need `server.h` in `main.c` file only.

- The`ecewo.h` header is the main module of our project. It provides many of various HTTP tools used for writing handlers and routers.

- The `void hello_world()` function is a handler. We get the request via `Req *req` and send a plain text response with `Res *res`. We'll see request handling more detailed in the [Route Handlers](/docs/route-handlers) chapter.

- The `int main()` function is the entry point of our program. We need to initialize the router first, and then we are able to define our routes, which are explained in [Defining Routes](/docs/defining-route) chapter more detailed.

- The `shutdown_hook()` is a function pointer that frees the server memory. Before calling `ecewo()`, [shutdown_hook()](/api/shutdown_hook/) must always be invoked to clean up server resources such as the router during shutdown.

- And `ecewo()` is the function that runs the server. It waits for a PORT, which is a `unsigned short` type of parameter.

> **NOTE:**
>
> Just like in the Express.js, we have to define our routes in the entry point, which is `main.c`. For modularity, we can define them outside and call in the `int main()` function.

Let's run the following commands in the terminal to build our server:

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
Server is running at: http://localhost:3000
```

Now if we go to `http://localhost:3000/` we'll see a basic `Hello, World!` text message.

## Ecewo-CLI (optional)

We can make our project configurations more easily via [Ecewo-CLI](https://github.com/savashn/ecewo-cli). It's using for creating and building projects easily, but more importantly, it makes easier to install some necessary libraries. Refer to its repository for usage.
