---
title: Route Handlers
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Writing handlers in Ecewo is similar to Express.js. Every handler takes to parameters: `Req *req` and `Res *res` and we'll take them from `ecewo.h` file.

## Sending A Response

We have a few response functions. When we are done with the handler, we need to send a response to the client using one of the following functions:
- [send_text()](/api/send_text/) is for `text/plain` responses. It takes *3* parameters: **response object, status code, and response body**.
- [send_html()](/api/send_html/) is for `html/plain` responses. It takes *3* parameters: **response object, status code, and response body**.
- [send_json()](/api/send_json/) is for `application/json` responses. It takes *3* parameters: **response object, status code, and response body**.
- [send_cbor()](/api/send_cbor/) is for `application/cbor` responses. It takes *4* parameters: **response object, status code, response body, and the length of the response body**.
- [reply()](/api/reply) is for general responses. It takes *5* parameters: **response object, status code, content-type, response body, and the length of the response body**.

### Sending Any Type of Response

We are able to send any type of response using `reply()`. Every other response functions call this function under the hood. So we can send plain text, JSON, HTML or even CBOR responses.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res) {
   reply(res, 200, "text/plain", "Hello, World!", strlen("Hello, World!"));
}
```

But we don't have to write the `Content-Type` and response length everytime. Therefore Ecewo provides more basic ways for sending response.

### Sending Plain Text

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res) {
   send_text(res, 200, "Hello, World!");
}
```

### Sending JSON

You can easily generate and parse JSON objects via [cJSON](https://github.com/DaveGamble/cJSON) or [jansson](https://github.com/akheron/jansson). See [Using JSON](/examples/using-json/) chapter for more detailed usage.

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    send_json(res, 200, "{ \"message\": \"hello world!\" }");
}
```

### Sending CBOR

To send CBOR responses, we'll need a library, such as [TinyCBOR](https://github.com/intel/tinycbor). Ecewo just provides an easy configuration to send the `application/cbor` responses:

```c
void hello_world(Req *req, Res *res)
{
    send_cbor(res, 200, buffer, len);
}
```

See [Using CBOR](/examples/using-cbor/) chapter for more detailed usage.

### Status Code Enums

Also, Ecewo provides enums for status codes. Responses can be sent using either integer status codes or enums that listed below:

```c
typedef enum
{
    // 1xx Informational
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLY_HINTS = 103,

    // 2xx Success
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,

    // 3xx Redirection
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    // 4xx Client Error
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511
} http_status_t;
```

Example response sending with status codes:

```c
send_text(res, 200, "Success");
send_text(res, 201, "Content created")
send_text(res, 400, "Bad request");
send_text(res, 404, "Not found");
send_text(res, 500, "Internal server error");
```

Example response sending with status code enums:

```c
send_text(res, OK, "Success");
send_text(res, CREATED, "Content created")
send_text(res, BAD_REQUEST, "Bad request");
send_text(res, NOT_FOUND, "Not found");
send_text(res, INTERNAL_SERVER_ERROR, "Internal server error");
```

They all will work.

## Handling Requests

We can easily access the request's `body`, `params`, `query`, and `headers`. We'll see just basic examples in this chapter.

Let's see how it basically works.

### Request Body

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_body(Req *req, Res *res)
{
    printf("Body: %s\n", req->body);
    send_text(res, 200, "Success!");
}

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();
    post("/print-body", print_body);
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's send a `POST` request with this body:

```json
{
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

to:

```
http://localhost:3000/print-body
```

We'll receive a `Success` message and see the body in the console:

```json
Body: {
    "name": "John",
    "surname": "Doe",
    "username": "johndoe"
}
```

For more advanced usage; see [Using JSON](/docs/using-json) chapter.

### Request Params

Let's take a specific user by params. We can access the params using the `get_params("slug");` function. Let's write a handler that gives us the "slug":

```c
// main.c

#include "server.h"
#include "ecewo.h"

void send_params(Req *req, Res *res)
{
    const char *slug = get_params(req, "slug"); // We got the params

    if (slug == NULL)
    {
        send_text(res, 400, "Missing 'slug' parameter");
        return;
    }

    send_text(res, 200, slug);
}

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();
    get("/send-params/:slug", send_params);
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Recompile the program and send a request to:

```
http://localhost:3000/send-params/testslug
```

Server will send us `testslug` response.

We can define more than one slug if we need using the same way. Here is an example:

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_more_params(Req *req, Res *res)
{
    const char *key = get_params(req, "key");      // We got the /:key
    const char *value = get_params(req, "value");  // We got the /:value

    if (key == NULL || value == NULL)
    {
        send_text(res, 400, "Missing 'key' or 'value' parameter");
        return;
    }

    printf("Key slug is %s and Value slug is %s\n", key, value);

    send_text(res, 200, "Success!");
}

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();
    get("/print-more-params/:key/and/:value");
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

If we go to the following path:

```
http://localhost:3000/print-more-params/foo/and/bar
```

we'll receive a `Success!` response and see the `foo` and `bar` in the console:

```
Key slug is foo and Value slug is bar
```

### Request Query

Just like the `params`, we can use `get_query("query");` to get the query params. Let's rewrite a handler using `query`: 

```c
// main.c

#include "server.h"
#include "ecewo.h"

void print_query(Req *req, Res *res)
{
    const char *name = get_query(req, "name");
    const char *surname = get_query(req, "surname");

    if (name == NULL || surname == NULL)
    {
        send_text(res, 400, "Missing required parameter.");
        return;
    }

    printf("Name: %s Surname: %s\n", name, surname);

    send_text(res, 200, "Success!");
}

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();
    get("/print-query", print_query);
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's recompile the program and send a request to:

```
http://localhost:3000/print-query?name=john&surname=doe
```

We'll receive a `Success!` responseand the query strings will be printed in the console:

```
Name: john Surname: doe
```

### Request Headers

Just like `params` and `query`, we can also access request headers using the `get_headers("header");` function.
Ecewo also provides different functions for authorization and session-based authentication.
However, if you simply want to access a specific item in `req->headers`, you can do so directly.

Typically, a standard `GET` request with `POSTMAN` have some headers like:

```json
{
    "User-Agent": "PostmanRuntime/7.43.3",
    "Accept": "*/*",
    "Postman-Token": "9b1c7dda-27f9-471a-9cdd-bfaf0d5b56a1",
    "Host": "localhost:3000",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
}
```

Let's say, we need the `User-Agent` header:

```c
// main.c

#include "server.h"
#include "ecewo.h"

void get_user_agent(Req *req, Res *res)
{
    const char *user_agent = get_headers(req, "User-Agent");

    if (user_agent == NULL)
    {
        send_text(res, 400, "Missing required parameter.");
        return;
    }

    send_text(res, 200, user_agent);
}

void destroy_app() {
   reset_router();
}

int main()
{
    init_router();
    get("/header", get_user_agent);
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's send a request via POSTMAN:

```
http://localhost:3000/header
```

The result will be something like this:

```
User Agent: PostmanRuntime/7.43.3
```
