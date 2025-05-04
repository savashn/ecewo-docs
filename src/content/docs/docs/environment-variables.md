---
title: Environment Variables
description: Documentation of ecewo - A minimal HTTP framework for C.
---

ecewo has built-in `env` parser, which is [dotenv-c](https://github.com/Isty001/dotenv-c). Let's see how it works.

First, create a `.env` file in your `src/` directory. Project structure should be like this:

```
├── ecewo/
└── src/
    ├── main.c
    ├── CMakeLists.txt
    └── .env
```

We define a `PORT` in `.env`:

```
// src/.env

PORT=4000
```

Let's parse it in `main.c`:

```sh
//src/main.c

#include "ecewo.h"
#include "dotenv.h"

int main()
{
    env_load(DEV_ENV, false);   // Load ".env" file
    const char *port = getenv("PORT");  // Get the "PORT"
    printf("PORT: %s\n", port);  // Print the "PORT"

    ecewo(4000);

    return 0;
}
```

We'll see the `PORT` in the console when building the program. However, `getenv` returns a `const char *`, and if we need to retrieve a non-character type variable, we must convert it first.

For example, `ecewo()` takes an `unsigned short` type variable. So, if we want to use the `PORT` from the `.env` file, we can do it like this:

```sh
// src/main.c

#include "ecewo.h"
#include "dotenv.h"

int main()
{
    env_load(DEV_ENV, false);
    const char *port = getenv("PORT");
    printf("PORT: %s\n", port);

    ecewo((unsigned short)port);

    return 0;
}
```
