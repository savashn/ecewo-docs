---
title: Using JSON
description: Documentation of Ecewo — A modern microframework for web development in C
---

Ecewo supports a powerful built-in JSON library called [Jansson](https://github.com/akheron/jansson).
It’s easy to use and allows us to work with JSON objects effortlessly. For more information, refer to the official [Jansson Documentation](https://jansson.readthedocs.io/en/latest/index.html).

## Creating JSON

Let's write our `hello world` example again, but this time it will send a JSON object instead of a plain text.

```sh
// src/handlers.c

#include "router.h"  // To handle the request and send a response
#include "jansson.h"  // To deal with JSON

void hello_world(Req *req, Res *res)
{
    // Create a JSON object
    json_t *json = json_object();

    // Add string to the JSON object we just created
    json_object_set_new(json, "hello", json_string("world"));

    // Convert the JSON object to a string
    // It is impossible to send a JSON without printing
    char *json_string = json_dumps(json, JSON_COMPACT);

    // Send the response with 200 status code
    // content-type must be "application/json" to send a json

    reply(res, "200 OK", "application/json", json_string);

    // Free the memory that allocated by cJSON
    json_decref(json);
    free(json_string);
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void hello_world(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
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

#include "router.h"
#include "jansson.h"

void handle_user(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing request body");
        return;
    }

    cjson_error_t error;
    json_t *json = json_loads(body, 0, &error);
    if (!json)
    {
        reply(res, "400 Bad Request", "text/plain", "Invalid JSON");
        return;
    }

    json_t *name_obj = json_object_get(json, "name");
    json_t *surname_obj = json_object_get(json, "surname");
    json_t *username_obj = json_object_get(json, "username");

    if (!json_is_string(name_obj) || !json_is_string(surname_obj) || !json_is_string(username_obj))
    {
        json_decref(json);
        reply(res, "400 Bad Request", "text/plain", "Missing fields");
        return;
    }

    const char *name = json_string_value(name_obj);
    const char *surname = json_string_value(surname_obj);
    const char *username = json_string_value(username_obj);

    printf("Name: %s\n", name);
    printf("Surname: %s\n", surname);
    printf("Username: %s\n", username);

    json_decref(json); // Free the JSON object
    reply(res, "200", "text/plain", "Success!");
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void handle_user(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers.h"

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
