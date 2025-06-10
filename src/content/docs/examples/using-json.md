---
title: Using JSON
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We'll use [cJSON](https://github.com/DaveGamble/cJSON) to work with JSON objects in this example, but you can also use [jansson](https://github.com/akheron/jansson) if you prefer. For more information, refer to its official documentation.

## Creating JSON

Let's write our `hello world` example again, but this time it will send a JSON object instead of a plain text.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void hello_world(Req *req, Res *res);

#endif
```

```c
// src/handlers.c

#include "handlers.h"   // To handle the request and send a response
#include "cJSON.h"      // To deal with JSON

void hello_world(Req *req, Res *res)
{
    // Create a JSON object
    cJSON *json = cJSON_CreateObject();

    // Add string to the JSON object we just created
    cJSON_AddStringToObject(json, "hello", "world");

    // Convert the JSON object to a string
    char *json_string = cJSON_PrintUnformatted(json);

    // Send the json response with 200 status code
    send_json(200, json_string);

    // Free the memory that allocated by jansson
    cJSON_Delete(json);
    free(json_string);
}
```

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/", hello_world);
    ecewo(4000);
    reset_router();
    return 0;
}
```

Now we can recompile and send a request to `http://localhost:4000/` again. We'll receive a JSON:

```
{"hello":"world"}
```

## Parsing JSON

This time, let's take a JSON and print it to console.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_user(Req *req, Res *res);

#endif
```

```c
// src/handlers.c

#include "handlers.h"
#include "cJSON.h"

void handle_user(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        send_text(400, "Missing request body");
        return;
    }

    cJSON *json = cJSON_Parse(body);

    if (!json)
    {
        send_text(400, "Invalid JSON");
        return;
    }

    const char *name = cJSON_GetObjectItem(json, "name")->valuestring;
    const char *surname = cJSON_GetObjectItem(json, "surname")->valuestring;
    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;

    if (!name || !surname || !username)
    {
        cJSON_Delete(json);
        send_text(400, "Missing fields");
        return;
    }

    printf("Name: %s\n", name);
    printf("Surname: %s\n", surname);
    printf("Username: %s\n", username);

    cJSON_Delete(json);
    send_text(200, "Success!");
}
```

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    post("/user", handle_user);
    ecewo(4000);
    reset_router();
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
