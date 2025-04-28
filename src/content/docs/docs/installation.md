---
title: Installation
description: A guide in my new Starlight docs site.
---

## Requirements

GCC is required to compile and run the program, that's all. Please note that ecewo is running on Windows only for now. Support for Linux and macOS is planned to be added in the future.

## Install

Since ecewo doesn't use any package manager, you need to clone this repo to use it. Follow these steps to clone:

```
git clone https://github.com/savashn/ecewo.git
cd ecewo
```

## Update

To update ecewo, simply copy the entire `ecewo` folder and replace your existing one.
Make sure that the system files starting with `ecewo/` listed in the SRC section of your `makefile` haven’t changed.
If they have, copy the SRC list from the new version’s `makefile` and paste it into your existing one.

## Makefile

The `makefile` is one of the most important file of your program. You must make the configuration of your `makefile` correct, otherwise you will get errors while trying to compile your program.

### CFLAGS

`CFLAGS` are the directory flags of your program. If you create a folder, you need to add its path into it to use header files in the folder you created.

```
CFLAGS = -I./ -I./ecewo -I./ecewo/lib -I./src
```

### LDFLAGS

`LDFLAGS` are the linking flags of your libraries. If your OS is Windows, you need to add `-lws2_32` flag.

```
LDFLAGS = -lws2_32
```

### SRC

There is an important config named `SRC` for your server in it and you need to deal with it while you're developing your server.

```
SRC = \
ecewo/server.c \
ecewo/router.c \
ecewo/routes.c \
ecewo/request.c \
ecewo/lib/session.c \
ecewo/lib/cjson.c \
```

There are root files in the `ecewo` directory. So to touch them would be dangerous.

When you creating a new `.c` file, you must add the filename into `SRC`. For example; if you create a new `handler.c` file in the `src` directory, you must add its path to the `SRC` list to compile that file.

### Shortcuts

There are some shortcuts at the bottom of the `makefile`:

```
make		// compile the program
make run	// run the program
make clean	// destroy the program
make build	// destroy, compile and then run the program

```

## Start Server

First, create a `src` folder in the root directory. It's your free space, so you will do everything in `src/` directory.

And we need also a `main.c` in the `src/` folder. It will be our main file, which controls the program.
We start the server, call our routes, and set up the database connection in it.

Let's configure a basic `main.c` file to start server first:

```sh
// src/main.c
#include "ecewo/server.h"

int main()
{
  ecewo(3000);
  return 0;
}

```

The `ecewo/server.h` header provides the `ecewo()` function, which starts the server.
You can specify the PORT on which you want to run your program. In this example, we are running it on `http://localhost:3000`

Before we run our server, we have to add this `main.c` file to the `SRC` list in our `makefile`. See the [Makefile](/docs/installation#src) if you don't know what that is.

```
SRC = \
  ecewo/server.c \
  ecewo/router.c \
  ecewo/routes.c \
  ecewo/request.c \
  ecewo/lib/session.c \
  ecewo/lib/cjson.c \
  src/main.c \  # We added it here
```

Now we can run `make build` command in terminal to compile and run the program.
We'll see following informations when our server is ready:

```
ecewo [version]
Server is running at: http://localhost:3000
```

Now if we go to `http://localhost:3000/` we'll see a basic text message:

```
404 Not Found
```

If you see this message, everything is all right. Our server is working. The reason the server gives us that response is that we haven't defined a route yet.
