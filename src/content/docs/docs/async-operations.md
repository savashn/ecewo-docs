---
title: Async Operations
description: Documentation of Ecewo — A modern microframework for web development in C
---

Since C doesn’t natively support asynchronous operations, this can be one of the more challenging aspects of working with Ecewo. As a result, async behavior may differ from what you're used to.

However, Ecewo offers an usual solution to this unusual situation for web developing: The `async()` and `await()` macros provided out of the box. These macros are simplify working with `libuv`, a native C library designed for asynchronous I/O operations.

## The Async Logic

Async operations in Ecewo are implemented as an operation chain. A chain includes:
- One entry point, which is our **handler**,
- One operation that includes at least two functions: A **_work** and a **_done**,
- One `free_async()` function to free the memory that allocated by async operation,
- One **struct** that includes our context.

Each operation is composed of two primary parts: A `_work` function that performs the **task** and a `_done` function that handles its **completion**. These two parts are inseparable and must always be used together.

Also it's important that the task function has to end with `_work` suffix and the completion function has to end with `_done` suffix. For example, these functions may be like `something_work()` and `something_done()`.

- The **handler** is the entry point. It receives the `req` and `res` objects and starts the chain by calling only the first `_work` using the `async()` macro.
- The **_work()** function performs the actual async task. Once it completes, it returns either a success or failure result to the `_done` using `ok()` or `fail()`.
- The **_done()** function processes the result received from the `_work`. It then either sends a response to the client using the `reply()` or triggers the next operation in the chain using the `await()`.
- The **free_async()** function will be called at the very end. It is responsible for freeing memory allocated by asynchronous operations. The function must be named `void free_async(void *foo)` — no other name or signature is allowed.

So, the async logic follows this flow:

```
handler() -> _work() -> _done() -> free_async()
```

In Ecewo, asynchronous operations work as chained from the bottom up. So our entry point —which is the **handler**— must be at the bottom.

If we imagine that we have 2 async operations in the chain, our `async` process will work as follows:

```sh
// src/async_handler.c

static void free_async(void *context){...}                              // free mem
static void second_done(void *context, int success, char *error){...}   // 2. done, exit
static void second_work(async_t *task, void *context){...}              // 2. work
static void first_done(void *context, int success, char *error){...}    // 1. done
static void first_work(async_t *task, void *context){...}               // 1. work
void handler(Req *req, Res *res){...}                                   // Entry point
```

If everything goes well, the very last `_done` function will send the latest response to the client. In this schema, it is `second_done()` function.

Let's go through an example to see how the process works.

## Example Usage

We are going to do a basic calculating example step by step to understand how async operations work. 

The example will be a very basic calculator that receives a number from `req->params` and does an addition first, and then a multiplication. So we will write a chain that includes 2 async operations

### Step 1: Create A Context Structure

```sh
// src/async_handler.c

#include "router.h" // For our handler, which is the entry point
#include "async.h"  // For asynchronous operations

// Context for chained operations

typedef struct
{
    Req *req;
    Res *res;
    long input;
    long intermediate;
    long final;
} ctx_t;
```

`Req *req` and `Res *res` must be in the struct everytime. The others are the variables we will use in the async operations.

### Step 2: Create An Entry Point

An entry point is our usual handler.

```sh
// src/async_handler.c

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_req(&req->params, "num");

    // Converte it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));

    ctx->req = req;
    ctx->res = res;
    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start chain: addition
    async(ctx, add);
}
```

The `async(ctx, add)` takes two parameters: First one is the context, second one is the name of `_work` and `_done` functions. So, our first async operation must be called as `add_work` and `add_done`.

### Step 3: Write The First Operation

```sh
// src/async_handler.c

// _done function of the first operation:
static void add_done(void *context, int success, char *error)
{
    await(context, multiply);
    // if success, "await" calls the next task named "multiply";
    // otherwise, returns an error
}

// _work function of the first operation:
static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *c = context;

    // Add 10 to the input
    c->intermediate = c->input + 10;

    // Go to the _done function
    ok(task);
}
```

A `_work` function has to come after its `_done` function all the time. The parameters `success` and `error` are handling under the hood.

### Step 4: Write The Second Operation

At the previously step, `add_done()` function called an operation named `multiply` by `await(context, multiply)` if the process is success. So let's write the `multiply` function.

```sh
// src/async_handler.c

// _done function of the second operation:
static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *c = context;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        reply(c->res, "500 Internal Server Error", "text/plain", error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           c->input, c->final);

        reply(c->res, "200 OK", "text/plain", buf);
        free_async(c);  // The latest "_done" has to free the memory
    }
}

// _work function of the second operation:
static void multiply_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *c = context;

    // example fail case: intermediate result is too large
    if (c->intermediate > 1000)
    {
        // Send an "error" to the "multiply_done()" function
        fail(task, "Intermediate too large to multiply");
    }
    else
    {
        // multiply intermediate result by 5
        c->final = c->intermediate * 5;

        // Send a "success" to the "multiply_done()" function
        ok(task);
    }
}
```

### Step 5: Write The `free_async()` Function

We have a `free_async()` function for memory safety. This function is automatically called if an error occurs at any point in the asynchronous chain, and it is responsible for freeing the allocated memory.

However, `free_async()` is **only** used when the chain fails. If the chain completes successfully and no errors occur, this function will not run automatically.

Therefore, we need to manually call this function at the exit point of the chain, which is the final `_done` function. In our example, that would be `multiply_done()`.

The `free_async()` function must be placed directly below the struct definition, as it is intended to be the very last function to run. If we have dynamically allocated memory in the chain, we can free it there. Even if we don't, we must still free the memory used by the `context`.

In our example, we need to free only the `context` memory:

```sh
// Cleanup context
static void free_async(void *ctx)
{
    free(ctx);
}
```

### Final View

In the end, the `async_handler.c` file should look like this:

```sh
#include "async.h"
#include "router.h"

// Context for chained operations
typedef struct
{
    Req *req;
    Res *res;
    long input;
    long intermediate;
    long final;
} ctx_t;

// Cleanup context
static void free_async(void *ctx)
{
    free(ctx);
}

// _done function of the second operation:
static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *c = context;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        reply(c->res, "500 Internal Server Error", "text/plain", error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           c->input, c->final);

        reply(c->res, "200 OK", "text/plain", buf);
        free_async(c); // The latest "_done" has to free the memory
    }
}

// _work function of the second operation:
static void multiply_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *c = context;

    // example fail case: intermediate result is too large
    if (c->intermediate > 1000)
    {
        // Send an "error" to the "multiply_done()" function
        fail(task, "Intermediate too large to multiply");
    }
    else
    {
        // multiply intermediate result by 5
        c->final = c->intermediate * 5;

        // Send a "success" to the "multiply_done()" function
        ok(task);
    }
}

// _done function of the first operation:
static void add_done(void *context, int success, char *error)
{
    await(context, multiply);
    // if success, "await" calls the next task named "multiply";
    // otherwise, returns an error
}

// _work function of the first operation:
static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *c = context;

    // Add 10 to the input
    c->intermediate = c->input + 10;

    // Go to the _done function
    ok(task);
}

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_req(&req->params, "num");

    // Converte it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));

    ctx->req = req;
    ctx->res = res;
    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start chain: addition
    async(ctx, add);
}
```

### Test

Let's run and test our async chain.

```
// src/CMakeLists.txt

cmake_minimum_required(VERSION 3.10)
project(my-project VERSION 0.1.0 LANGUAGES C)

set(APP_SRC
    ${CMAKE_CURRENT_SOURCE_DIR}/main.c
    ${CMAKE_CURRENT_SOURCE_DIR}/async_handler.c
    PARENT_SCOPE
)
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void calculate(Req *req, Res *res); // Our entry point

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers.h"

int main()
{
    get("/calculate/:num", calculate);
    ecewo(4000);
    return 0;
}
```

Now let's build and go to `http://localhost:4000/calculate/100`. We will receive that response:

```
((100) + 10) * 5 = 550
```

If go to `http://localhost:4000/calculate/10000` now and we'll receive:

```
Intermediate too large to multiply
```
