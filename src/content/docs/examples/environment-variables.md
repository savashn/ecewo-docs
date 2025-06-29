---
title: Environment Variables
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

First, we need to add [dotenv-c](https://github.com/Isty001/dotenv-c) to our project, and then create a `.env` file in the root directory of our project. Project structure should something be like this:

```
your-project/
├── CMakeLists.txt
├── .env
└── src/
    └── main.c
```

We define a `PORT` in `.env`:

```
// .env

PORT=3000
```

Let's parse it in `main.c`:

```c
//src/main.c

#include <stdio.h>
#include "server.h"
#include "dotenv.h"

int main()
{
    env_load("..", false);              // Load ".env" file
    const char *port = getenv("PORT");  // Get the "PORT"
    printf("PORT: %s\n", port);         // Print the "PORT"

    ecewo(3000);                        // Start the server
    return 0;                           // Exit
}
```

We'll see the `PORT` in the console when building the program. However, `getenv` returns a `const char *` everytime, and if we need to retrieve a non-character type variable, we must convert it first.

For example, `ecewo()` takes an `unsigned short` type variable. So, if we want to use the `PORT` from the `.env` file, we can do it like this:

```c
// src/main.c

#include "server.h"
#include "dotenv.h"

int main()
{
    env_load("..", false);

    const char *port = getenv("PORT");
    const unsigned short PORT = (unsigned short)atoi(port);

    ecewo(PORT);
    return 0;
}
```
