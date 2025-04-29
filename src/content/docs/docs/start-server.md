---
title: Start Server
description: Documentation of ecewo - A minimal HTTP framework for C.
---

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
