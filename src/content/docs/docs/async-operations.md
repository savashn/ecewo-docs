---
title: Async Operations
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Since C doesn’t natively support asynchronous operations, this can be one of the more challenging aspects of working with Ecewo. As a result, async behavior may differ a bit from what you're used to.

## General Purpose Async

Ecewo includes an `async.h` module that provides `task()` and `then()` functions, similar to `promise().then()` behavior in JavaScript. These are simplify working with [libuv](https://github.com/libuv/libuv), a native C library designed for asynchronous I/O operations.

`async.h` uses libuv’s thread pool to execute tasks in the background. While it doesn't create a new thread for every task, using it for very lightweight operations may still introduce context-switching overhead and unnecessary resource usage.

For this reason, it is recommended to use `async.h` only for **heavy or long-running operations** — such as processing large files or making external API calls that involve network latency or blocking behavior.

For asynchronous database queries, see the [Async Postgres Queries](/docs/async-operations/#async-postgres-queries) section.

### The Async Logic

Async operations in Ecewo are implemented as an operation chain. A chain includes:
- One entry point, which is our **handler**,
- One operation that includes at least two functions: A **task function** and a **completion function**,
- One **struct** that includes our context.

Each operation is composed of two primary parts: A **task function** that performs the *task* and a **completion function** that handles its *completion*. These two parts are inseparable and must always be used together.

Every async handler requires a **task function** that does the job, and every task function requires a **completion function** to process its result.

- The **handler** is the entry point. It receives the `*req` and `*res` objects and starts the chain by calling only the first **task function** using `task()`.
- The **task function** performs the actual async task. Once it completes, it returns either a success or failure result to the **completion function** using `ok()` or `fail()`.
- The **completion function** processes the result received from the **task function**. It then either sends a response to the client or triggers the next operation in the chain using the `then()` macro.

So, the async logic follows this flow:

For single async operation:

```
handler() -> task() -> send response
```

For multiple async operation:

```
handler() -> task() -> then() -> then() -> ... -> send response
```

If we imagine that we have 2 async operations in the chain, our `async` process will work as follows:

```c
// src/async_handler.c

void handler(Req *req, Res *res){...}                                   // Entry point
static void first_work(async_t *task, void *context){...}               // 1. work
static void first_done(void *context, int success, char *error){...}    // 1. done
static void second_work(async_t *task, void *context){...}              // 2. work
static void second_done(void *context, int success, char *error){...}   // 2. done, exit
```

The `first_work()` function process the operation, and send the result to the `first_done()` function using `ok()` for success and `fail()` for error.

The `first_done()` function send a response to the client with the result that received from `first_work()`. Or, if the async chain continues, the `first_done()` function calls the `second_work()` function using `then()`.

The `second_done()` function process the next operation just like the first one, and then the `second_done()` function send the latest response to the client.

Let's go through an example to see how the process works.

### Example Usage

We are going to do a basic calculating example step by step to understand how async operations work. 

The example will be a very basic calculator that receives a number from `req->params` and does an addition first, and then a multiplication. So we will write a chain that includes 2 async operations.

### Step 1: Create A Context Structure And Declare Functions

```c
// src/async_handler.c

#include "ecewo.h"  // For our handler, which is the entry point
#include "async.h"  // For asynchronous operations

// Context for chained operations
typedef struct
{
    Res *res;
    long input;
    long intermediate;
    long final;
} ctx_t;

// Forward declarations of our async chain
static void add_work(async_t *task, void *context);
static void add_done(void *context, int success, char *error);
static void multiply_work(async_t *task, void *context);
static void multiply_done(void *context, int success, char *error);
```

We define `Res *res` in the context struct because we use it out of the handler, so we move its memory within the chain. If we use `Req *req` too, we also need to define it in the struct.

### Step 2: Create An Entry Point

An entry point is our usual handler.

```c
// src/async_handler.c

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_params(req, "num");

    // Convert it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));
    if (!ctx)
    {
        send_text(res, 500, "Memory allocation failed");
        return;
    }

    // Deep copy Res to heap
    ctx->res = copy_res(res);

    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start the chain: addition
    task(ctx, add_work, add_done);
}
```

The [copy_res()](/api/copy_res) function is using for deep copying the `Res` object. We copy it into context structure because we need it in `add_work` and `add_done` functions. If we also need `Req` object, we can use [copy_req()](/api/copy_req) function.

The `task(ctx, add_work, add_done)` takes three parameters: First one is the context, second one is the task function, and the third one is the completion function.

### Step 3: Write The First Operation

```c
// src/async_handler.c

static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // Add 10 to the input
    ctx->intermediate = ctx->input + 10;

    // Go to the _done function
    ok(task);
}

static void add_done(void *context, int success, char *error)
{
    if (success)
    {
        then(context, success, error, multiply_work, multiply_done);
        // if success, "then" calls the next task named "multiply"
    }
    else
    {
        // Assign the context
        ctx_t *ctx = context;

        // Send a response
        send_text(ctx->res, 500, error);

        // Free the allocated memories
        destroy_res(ctx->res);
        free(ctx);
    }
}
```

The [destroy_res()](/api/destroy_res) function is for freeing the copy of `Res` object. Ecewo also provides [destroy_req()](/api/destroy_req) function if we need.

### Step 4: Write The Second Operation

At the previously step, `add_done()` function called the next operation with `then(context, success, error, multiply_work, multiply_done)` if the process is success. So let's write the multiplying operation.

```c
// src/async_handler.c

static void multiply_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // example fail case: intermediate result is too large
    if (ctx->intermediate > 1000)
    {
        // Send an "error" to the "multiply_done()" function
        fail(task, "Intermediate too large to multiply");
    }
    else
    {
        // multiply intermediate result by 5
        ctx->final = ctx->intermediate * 5;

        // Send a "success" to the "multiply_done()" function
        ok(task);
    }
}

static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *ctx = context;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        send_text(ctx->res, 500, error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           ctx->input, ctx->final);

        send_text(ctx->res, 200, buf);
    }

    // Ensure memory is always freed regardless of success/failure
    destroy_res(ctx->res);
    free(ctx);
}
```

### Final View

In the end, the `async_handler.c` file should look like this:

```c
// src/async_handler.c

#include "async.h"
#include "ecewo.h"

// Context for chained operations
typedef struct
{
    Res *res;
    long input;
    long intermediate;
    long final;
} ctx_t;

// Forward declarations of our async chain
static void add_work(async_t *task, void *context);
static void add_done(void *context, int success, char *error);
static void multiply_work(async_t *task, void *context);
static void multiply_done(void *context, int success, char *error);

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_params(req, "num");

    // Convert it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));
    if (!ctx)
    {
        send_text(res, 500, "Memory allocation failed");
        return;
    }

    // Copy Res to heap
    ctx->res = copy_res(res);
    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start the chain: addition
    task(ctx, add_work, add_done);
}

static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // Add 10 to the input
    ctx->intermediate = ctx->input + 10;

    // Go to the _done function
    ok(task);
}

static void add_done(void *context, int success, char *error)
{
    if (success)
    {
        then(context, success, error, multiply_work, multiply_done);
        // if success, "then" calls the next task named "multiply"
    }
    else
    {
        // Assign the context
        ctx_t *ctx = context;

        // Send a response
        send_text(ctx->res, 500, error);

        // Free the allocated memories
        destroy_res(ctx->res);
        free(ctx);
    }
}

static void multiply_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // example fail case: intermediate result is too large
    if (ctx->intermediate > 1000)
    {
        // Send an "error" to the "multiply_done()" function
        fail(task, "Intermediate too large to multiply");
    }
    else
    {
        // multiply intermediate result by 5
        ctx->final = ctx->intermediate * 5;

        // Send a "success" to the "multiply_done()" function
        ok(task);
    }
}

static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *ctx = context;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        send_text(ctx->res, 500, error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           ctx->input, ctx->final);

        send_text(ctx->res, 200, buf);
    }

    // Ensure memory is always freed regardless of success/failure
    destroy_res(ctx->res);
    free(ctx);
}
```

### Test

Let's run and test our async chain.

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void calculate(Req *req, Res *res); // Our entry point

#endif
```

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();
    get("/calculate/:num", calculate);
    ecewo(3000);
    reset_router();
    return 0;
}
```

Now let's build by running these commands:

```shell
mkdir build && cd build && cmake .. && cmake --build .
```

Start the server and go to `http://localhost:3000/calculate/100`. We will receive that response:

```
((100) + 10) * 5 = 550
```

If go to `http://localhost:3000/calculate/10000` now and we'll receive:

```
Intermediate too large to multiply
```

### Note

> **Why We Don't Basically Use `malloc` To Copy The `Req` and `Res` Objects?**
>
> Because the `Res` object has headers array. If we use `malloc`, it will shallow copy and causes the dangling pointer. Therefore we need to deep copy it using `copy_res()` and free it using `destroy_res()`. If we need to call `get_params()`, `get_query()` or `get_headers()` out of the handler, we also need to deep copy the `Req` object using `copy_req()` and free it using `destroy_req()`.

**Shallow copy (DON'T DO THIS):**
```c
ctx_t *ctx = calloc(1, sizeof(ctx_t));

ctx->req = malloc(sizeof(*ctx->req));
ctx->res = malloc(sizeof(*ctx->res));

*ctx->req = *req;
*ctx->res = *res;
```

**Deep Copy (DO THIS):**
```c
ctx_t *ctx = calloc(1, sizeof(ctx_t));

ctx->req = copy_req(req);
ctx->res = copy_res(res);
```

## Async Postgres Queries

For asynchronous database queries, Ecewo supports [libpq](https://www.postgresql.org/docs/current/libpq.html) — the official PostgreSQL client library, which includes asynchronous support.

If you are using PostgreSQL, it is recommended to use [pquv](https://github.com/savashn/pquv) — which combines libpq and libuv — for database operations instead of `async.h`.

If you’re using another database, such as SQLite, you may still use `async.h` for performance-critical big queries.

### Installation

- You need to [install PostgreSQL](https://www.postgresql.org/download/) first.
- Copy the `pquv.c` and `pquv.h` files from [the repository](https://github.com/savashn/pquv) and paste them into your existing project.
- Configure your CMake as follows:

```cmake
find_package(PostgreSQL REQUIRED)

target_include_directories(server PRIVATE
    ${PostgreSQL_INCLUDE_DIRS}
)

target_link_libraries(server PRIVATE
    ecewo
    ${PostgreSQL_LIBRARIES}
)
```

### Usage

`pquv.h` is providing three functions:

- `pquv.create()` to create an async operation. It takes 2 parameters: a context and database connection.
- `pquv.queue()` to queue a database query. It takes 5 parameters: the variable that created with `pquv.create()`, the SQL query, the count of params, the result callback, and the context.
- `pquv.execute()` to execute the async operation. It takes 1 parameter: the variable that created with `pquv.create()`.

Here is an example of synchronous querying: 

```c
void get_all_users(Req *req, Res *res)
{
    const char *sql = "SELECT id, name, username FROM users;";

    PGresult *resPQ = PQexec(db, sql);
    if (PQresultStatus(resPQ) != PGRES_TUPLES_OK)
    {
        fprintf(stderr, "DB select failed: %s", PQerrorMessage(db));
        PQclear(resPQ);
        send_text(res, 500, "DB select failed");
        return;
    }

    int rows = PQntuples(resPQ);
    cJSON *json_array = cJSON_CreateArray();

    for (int i = 0; i < rows; i++)
    {
        int id = atoi(PQgetvalue(resPQ, i, 0));
        const char *name = PQgetvalue(resPQ, i, 1);
        const char *username = PQgetvalue(resPQ, i, 2);

        cJSON *user_json = cJSON_CreateObject();
        cJSON_AddNumberToObject(user_json, "id", id);
        cJSON_AddStringToObject(user_json, "name", name);
        cJSON_AddStringToObject(user_json, "username", username);

        cJSON_AddItemToArray(json_array, user_json);
    }

    PQclear(resPQ);

    char *json_string = cJSON_PrintUnformatted(json_array);
    send_json(res, 200, json_string);

    cJSON_Delete(json_array);
    free(json_string);
}
```

This is really short, but the code is blocking synchronous. We can make it non-blocking asynchronous like that:

```c
#include "handlers.h"
#include "cJSON.h"
#include "pq.h"

// Callback structure to hold request/response context
typedef struct
{
    Res *res;
} ctx_t;

static void free_ctx(ctx_t *ctx)
{
    if (!ctx)
        return;

    if (ctx->req)
        destroy_res(ctx->res);

    free(ctx);
}

static void users_result_callback(pg_async_t *pg, PGresult *result, void *data);

// Async version of get_all_users
void get_all_users_async(Req *req, Res *res)
{
    const char *sql = "SELECT id, name, username FROM users;";

    // Create context to pass to callback
    ctx_t *ctx = calloc(1, sizeof(ctx_t));
    if (!ctx)
    {
        send_text(res, 500, "Memory allocation failed");
        return;
    }

    // Deep copy the Res object
    ctx->res = copy_res(res);

    // Create async PostgreSQL context
    pg_async_t *pg = pquv_create(db, ctx);
    if (!pg)
    {
        send_text(res, 500, "Failed to create async context");
        free(ctx);
        return;
    }

    // Queue the query
    int result = pquv_queue(pg, sql, 0, NULL, users_result_callback, ctx);
    if (result != 0)
    {
        send_text(res, 500, "Failed to queue query");
        free(ctx);
        return;
    }

    // Start execution (this will return immediately)
    result = pquv_execute(pg);
    if (result != 0)
    {
        printf("get_all_users_async: Failed to execute query\n");
        send_text(res, 500, "Failed to execute query");
        free(ctx);
        return;
    }

    printf("get_all_users_async: Query started asynchronously\n");
    // Function returns here, callback will be called when query completes
}

// Callback function that processes the query result
static void users_result_callback(pg_async_t *pg, PGresult *result, void *data)
{
    ctx_t *ctx = (ctx_t *)data;

    if (!ctx || !ctx->res)
    {
        printf("Invalid context\n");
        return;
    }


    // Check result status
    ExecStatusType status = PQresultStatus(result);
    if (status != PGRES_TUPLES_OK)
    {
        printf("Query failed: %s\n", PQresultErrorMessage(result));
        send_text(ctx->res, 500, "DB select failed");
        free(ctx);
        return;
    }

    int rows = PQntuples(result);
    cJSON *json_array = cJSON_CreateArray();

    for (int i = 0; i < rows; i++)
    {
        int id = atoi(PQgetvalue(result, i, 0));
        const char *name = PQgetvalue(result, i, 1);
        const char *username = PQgetvalue(result, i, 2);

        cJSON *user_json = cJSON_CreateObject();
        cJSON_AddNumberToObject(user_json, "id", id);
        cJSON_AddStringToObject(user_json, "name", name);
        cJSON_AddStringToObject(user_json, "username", username);

        cJSON_AddItemToArray(json_array, user_json);
    }

    char *json_string = cJSON_PrintUnformatted(json_array);
    send_json(ctx->res, 200, json_string);

    // Cleanup
    cJSON_Delete(json_array);
    free(json_string);
    free_ctx(ctx);

    printf("users_result_callback: Response sent successfully\n");

    // If you want to continue the querying,
    // you shuld basicly write a new `pquv_queue()` here
    // it will queue the new query immediately
}
```

> **NOTE**
>
> The `pquv_create()` and `pquv_execute()` functions have to run once. If you wish to continue with more queries, you should basicly write the new queue with `pquv_queue()` and it will be ran automatically.
