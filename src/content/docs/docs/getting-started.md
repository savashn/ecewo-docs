---
title: Getting Started
description: Documentation of Ecewo — A modern microframework for web development in C
---

## Requirements

- CMake version 3.10 or higher
- A C compiler (GCC, Clang, or MSVC)
- MSYS2 and Git Bash if you are using Windows

## Installation

You need to install Ecewo CLI first. Run this command to install:

```bash
curl -o installer.sh "https://raw.githubusercontent.com/savashn/ecewo/main/installer.sh" && chmod +x installer.sh && ./installer.sh
```

This command installs the Ecewo CLI to your user path. To install it to the system path for all users, run the following command with administrator privileges:

```bash
curl -o installer.sh "https://raw.githubusercontent.com/savashn/ecewo/main/installer.sh" && chmod +x installer.sh && ./installer.sh --admin
```

> Run `make help` if you want to see the options.

All the CLI commands are here:

- `ecewo run`       — Build and run
- `ecewo rebuild`   — Build from scratch
- `ecewo update`    — Update Ecewo
- `ecewo migrate`   — Migrate the CMakeLists.txt file
- `ecewo install`   — Install packages

To see all the CLI commands, run:

```
ecewo help
```

Let's create an example `hello world` app by running the following command:

```
ecewo create
```

This command is going to create a basic structure in `src/` directory. Let's look into it.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void hello_world(Req *req, Res *res);

#endif
```

This is defining handler. We include `"ecewo.h"` header, which is the main module of our project. It provides many of various HTTP tools —such as `Req`, `Res`, and many others— used for writing handlers and routers.

```c
// src/handlers.c

#include "handlers.h"

void hello_world(Req *req, Res *res)
{
    send_text(200, "hello world!");
}
```

And this is our handler. We get the request via `Req *req` that we'll see more detailed in the next chapter. `Res *res` is our response header, we send it in every response. And `send_text()` is a macro for sending `text/plain` responses to the client.

When we are done with the handler, we need to send a response to the client using one of the following macros:
- `send_text()` is for `text/plain` responses,
- `send_html()` is for `html/plain` responses,
- `send_json()` is for `application/json` responses,
- `send_cbor()` is for `application/cbor` responses.

Basically, they take 2 parameters: a status code and a response body — except for `send_cbor()`, which takes three: a status code, a response body, and the length of the response body.

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
  init_router();
  get("/", hello_world);
  ecewo(4000);
  final_router();
  return 0;
}
```

And this is the entry point. The `server.h` header provides the `ecewo()` function that starts the server. `ecewo()` takes a `PORT` parameter of type `unsigned short`.

We can create our routers with `get()`, `post()`, `put()` and `del()` methods. They takes two parameters: First one is the path and second one is the handler.

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

Now we can run the following command in the terminal to build and run our server.

```
ecewo run
```

When we ran the suitable command; we’ll see following informations if our server is ready:

```
ecewo [version]
Server is running at: http://localhost:4000
```

Now if we go to `http://localhost:4000/` we'll see a basic `hello world!` text message.

> **NOTE:**
>
> When we create a new `.c` file, we need to run `ecewo migrate` command before running `ecewo run`. It will automatically configure `CMakeLists.txt` file for us.
