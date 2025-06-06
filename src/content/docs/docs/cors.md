---
title: CORS
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo provides built-in `CORS` configuration feature. It takes these options:

- `.origin` = "*" as default
- `.methods` = "GET, POST, PUT, DELETE, OPTIONS" as default
- `.headers` = "Content-Type" as default
- `.credentials` = "false" as default
- `.max_age` = "3600" as default
- `.enabled` = true as default

> **NOTE:**
>
> If you want to disable the `CORS` configuration for a while, you can add `.enabled = false` to your configuration to do it.

Let's write a test handler with CORS:

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

#include "handlers.h"

void hello_world(Req *req, Res *res)
{
    set_header(res, "X-Custom", "value");
    send_text(200, "hello world");
}
```

Now let's write our `CORS` configuration:

```c
// src/main.c

#include "server.h"
#include "cors.h"

int main()
{
    cors_t my_cors = {
        .origin = "http://localhost:3000",        // Default "*"
        .methods = "GET, POST, OPTIONS",          // Default "GET, POST, PUT, DELETE, OPTIONS"
        .headers = "Content-Type, Authorization", // Default "Content-Type"
        .credentials = "true",                    // Default "false"
        .max_age = "86400",                       // Default "3600"
    };

    init_cors(&my_cors);    // Register CORS

    init_router();

    get("/", hello_world);

    ecewo(4000);
    final_router();
    final_cors();   // Free the memory that allocated by CORS
    return 0;
}
```

Now let's send three different requests from different origins to `http://localhost:4000/`.

Send a request from `http://localhost:3000`, which is allowed origin:

```
curl -i -H "Origin: http://localhost:3000" http://localhost:4000/
```

The response will be:
```
HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:3000       
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
X-Custom: value
Content-Type: text/plain
Content-Length: 4
Connection: keep-alive
```

That means everything is OK, the headers we set in CORS configuration has been sent.

Send a request from `http://localhost:3001`, which is not allowed origin:

```
curl -i -H "Origin: http://localhost:3001" http://localhost:4000/
```

The response will be:
```
HTTP/1.1 200   
X-Custom: value
Content-Type: text/plain
Content-Length: 4
Connection: keep-alive
```

There are no `CORS` headers, that means request is not allowed. Response status is `200` because server is still working, but browser will not show the page.

Send a preflight request from `http://localhost:3001` origin, which is not allowed:

```
curl -i -X OPTIONS -H "Origin: http://localhost:3001" -H "Access-Control-Request-Method: GET" http://localhost:4000/
```

The response will be:
```
HTTP/1.1 403
Content-Type: text/plain
Content-Length: 0
Connection: keep-alive
```

The response status will be `403` for now allowed preflight requests.
