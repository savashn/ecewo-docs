---
title: Getting Started
description: Documentation of Ecewo — A modern microframework for web development in C
---

## Requirements

- CMake version 3.10 or higher
- A C compiler (GCC, Clang, or MSVC)
- MINGW64 if you are using Windows

## Installation

You need to clone the repository to install Ecewo. Follow these steps to clone:

```
git clone https://github.com/savashn/ecewo.git
cd ecewo
```

Ecewo includes some scripts to make configuration easier. You can view them by running `./ecewo.sh`, or, if you prefer PowerShell, `./ecewo.bat`. Here are the available configuration commands:

- `--run`       — Build and run
- `--rebuild`   — Build from scratch
- `--update`    — Update Ecewo
- `--migrate`   — Migrate the CMakeLists.txt file
- `--install`   — Install packages

Let's create an example `hello world` app by running the following command:

For Linux/macOS:
```
chmod +x create.sh
./create.sh
```

For Windows:

```
./create.bat
```

>**NOTE:**
>
> You need to replace `--` with `/` for PowerShell.

This command is going to create a basic structure in `src/` directory. Let's look into it.

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void hello_world(Req *req, Res *res);

#endif
```

This is defining handler. We include `"ecewo.h"` header, which is the main module of our project. It provides many of various HTTP tools —such as `Req`, `Res`, `reply()` and many others— used for writing handlers and routers.

```sh
// src/handlers.c

#include "handlers.h"

void hello_world(Req *req, Res *res)
{
    reply(res, 200, "text/plain", "hello world!");
}
```

And this is our handler. We get the request via `Req *req` that we'll see more detailed in the next chapter. `Res *res` is our response header, we send it in every response. And `reply()` is using for sending a response to the client.

When we are done with the handler, we should send a response to the client via `reply()` function. Basically, it takes 4 parameters:
- The `res` parameter,
- Status code,
- Content-Type,
- Response body

```sh
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

>**NOTE:**
>
> We have to use double quots `""` to define the route path every time. If we accidentally write single quots `''`, we'll get an error.

```
get("/", hello_world); // CORRECT
get('/', hello_world); // INCORRECT
```

Now we can run the following command in the terminal to build and run our server.

For Linux/MacOS:
```
chmod +x ecewo.sh
./ecewo.sh --run
```

For Windows:

```
./ecewo.bat /run
```

When we ran the suitable command; we’ll see following informations if our server is ready:

```
ecewo [version]
Server is running at: http://localhost:4000
```

Now if we go to `http://localhost:4000/` we'll see a basic `hello world!` text message.

>**NOTE:**
>
>When we create a new `.c` file, we need to run `./ecewo.sh --migrate` command before running `./ecewo.sh --run` (for PowerShell, must be `./ecewo.bat /migrate` and `./ecewo.bat /run`). It will automatically configure `CMakeLists.txt` file for us.
