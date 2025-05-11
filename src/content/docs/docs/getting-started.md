---
title: Getting Started
description: Documentation of Ecewo — A modern microframework for web development in C
---

## Requirements

- CMake version 3.10 or higher
- A C compiler (GCC, Clang, or MSVC)
- MINGW64 if you are using Windows

## Installation

Since Ecewo doesn't use neither a package manager nor CLI (yet), all you need to do is clone this repo and make some manual configurations to use it. Follow these steps to clone:

```
git clone https://github.com/savashn/ecewo.git
cd ecewo
```

## Start Server

First, we need to set up our playground by creating a `src` folder in the root directory, and a `main.c` file inside it as the entry point of our program. We start the server, call our routes, and set up the database connection in `main.c`.

```
mkdir src
cd src
touch main.c
```

Or, if you use PowerShell:

```
mkdir src
cd src
ni main.c
```

### Write The Entry Point

Let’s configure a basic `main.c` file to start server first:

```sh
// src/main.c

#include "server.h"

int main()
{
  ecewo(4000);
  return 0;
}
```

The `server.h` header provides the `ecewo()` function that starts the server. `ecewo()` takes a `PORT` parameter of type `unsigned short`.

Now we need a `CMakeLists.txt` file to compile our program. So let's create one:

```
// src/CMakeLists.txt

cmake_minimum_required(VERSION 3.10)
project(your-project VERSION 0.1.0 LANGUAGES C)

set(APP_SRC
    ${CMAKE_CURRENT_SOURCE_DIR}/main.c
    PARENT_SCOPE
)
```

The `set(APP_SRC)` command defines a list of `.c` files located in the `src` folder. Whenever you add a new source file, you need to include it in this list so it can be compiled.

### Build And Run The Server

In the root directory, there are two script files that allow us to build and run the program quickly. We can build the server manually, or automatically by using one of those scripts.

Linux / macOS:

```
chmod +x build.sh
./build.sh
```

Windows:

```
./build.bat
```

**Building from scratch:**

```
# Linux/macOS

./build.sh --rebuild`
```

```
# Windows:

./build.bat /rebuild
```

When we ran the suitable command; we’ll see following informations if our server is ready:

```
ecewo [version]
Server is running at: http://localhost:4000
```

Now if we go to `http://localhost:4000/` we'll see a basic text message:

```
404 Not Found
```

If you see this message, know that everything is all right; our server is working. The reason the server gives us that response is that we haven't defined a route yet.
