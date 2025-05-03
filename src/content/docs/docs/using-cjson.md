---
title: Using cJSON
description: Documentation of ecewo - A minimal HTTP framework for C.
---

ecewo supports a powerful built-in JSON library called [cJSON](https://github.com/DaveGamble/cJSON).
It's easy to get used to using it, allowing us to work with JSON objects effortlessly. For more information, refer to its documentation.

## Creating JSON

Let's write our `hello world` example again, but this time it will send a JSON object instead of a plain text.

```sh
// src/handlers.c

#include <stdio.h>  // To manage the memory
#include "ecewo.h"  // To handle the request and send a response
#include "cjson.h"  // To deal with JSON

void hello_world(Req *req, Res *res)
{
    // Create a JSON object

    cJSON *json = cJSON_CreateObject();

    // Add string to the JSON object we just created

    cJSON_AddStringToObject(json, "hello", "world");

    // Convert the JSON object to a string
    // It is impossible to send a JSON without printing

    char *json_string = cJSON_PrintUnformatted(json);

    // Send the response with 200 status code
    // content-type must be "application/json" to send a json

    reply(res, "200 OK", "application/json", json_string);

    // Free the memory that allocated by cJSON

    cJSON_Delete(json);
    free(json_string);
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void hello_world(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "server.h"
#include "ecewo.h"
#include "handlers.h"

int main()
{
    get("/", hello_world);
    ecewo(4000);
    return 0;
}
```

Now we can recompile and send a request to `http://localhost:4000/` again. We'll receive a JSON:

```
{"hello":"world"}
```

## Parsing JSON

This time, let's take a JSON and print it to console.

```sh
// src/handlers.c

#include <stdio.h>
#include "ecewo.h"
#include <cjson.h>

void handle_user(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing request body");
        return;
    }

    cJSON *json = cJSON_Parse(body);

    if (!json)
    {
        reply(res, "400 Bad Request", "text/plain", "Invalid JSON");
        return;
    }

    const char *name = cJSON_GetObjectItem(json, "name")->valuestring;
    const char *surname = cJSON_GetObjectItem(json, "surname")->valuestring;
    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;

    if (!name || !surname || !username)
    {
        cJSON_Delete(json);
        reply(res, "400 Bad Request", "text/plain", "Missing fields");
        return;
    }

    printf("Name: %s\n", name);
    printf("Surname: %s\n", surname);
    printf("Username: %s\n", username);

    cJSON_Delete(json); // Free the JSON object
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo/router.h"

void handle_user(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo/server.h"
#include "routes.h"
#include "handlers/handlers.h"

int main()
{
    post("/user", handle_user);
    ecewo(4000);
    return 0;
}
```

Let's recompile the program and send a `POST` request to `http://localhost:4000/user` with this body:

```
{
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

We'll see in the console:

```
Name: John
Surname: Doe
Username: johndoe
```
