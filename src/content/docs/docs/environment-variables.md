---
title: Environment Variables
description: Documentation of Ecewo — A modern microframework for web development in C
---

Ecewo has built-in `env` parser, which is [dotenv-c](https://github.com/Isty001/dotenv-c). Let's see how it works.

First, install `dotenv-c` by running the following command:

```
./build.sh --install --dotenv
```

If you use PowerShell:

```
./build.bat /install --dotenv
```

And create a `.env` file in the root directory of your project. Project structure should be like this:

```
├── ecewo/
├── .env
└── src/
    ├── main.c
    └── CMakeLists.txt
```

We define a `PORT` in `.env`:

```
// src/.env

PORT=4000
```

Let's parse it in `main.c`:

```sh
//src/main.c

#include <stdio.h>
#include "server.h"
#include "dotenv.h"

int main()
{
    env_load(ENV, false);               // Load ".env" file
    const char *port = getenv("PORT");  // Get the "PORT"
    printf("PORT: %s\n", port);         // Print the "PORT"

    ecewo(4000);                        // Start the server
    return 0;                           // Exit
}
```

We'll see the `PORT` in the console when building the program. However, `getenv` returns a `const char *` everytime, and if we need to retrieve a non-character type variable, we must convert it first.

For example, `ecewo()` takes an `unsigned short` type variable. So, if we want to use the `PORT` from the `.env` file, we can do it like this:

```sh
// src/main.c

#include "server.h"
#include "dotenv.h"

int main()
{
    env_load(ENV, false);

    const char *port = getenv("PORT");
    const unsigned short PORT = (unsigned short)atoi(port);

    ecewo(PORT);
    return 0;
}
```
