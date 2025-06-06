---
title: Async Operations
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Since C doesn’t natively support asynchronous operations, this can be one of the more challenging aspects of working with Ecewo. As a result, async behavior may differ a bit from what you're used to.

However, Ecewo offers an usual solution to this unusual situation for web developing: The `async()` and `await()` macros provided out of the box. These macros are simplify working with [libuv](https://github.com/libuv/libuv), a native C library designed for asynchronous I/O operations.

## The Async Logic

Async operations in Ecewo are implemented as an operation chain. A chain includes:
- One entry point, which is our **handler**,
- One operation that includes at least two functions: A **_work** and a **_done**,
- One **struct** that includes our context.

Each operation is composed of two primary parts: A `_work` function that performs the **task** and a `_done` function that handles its **completion**. These two parts are inseparable and must always be used together. Every async handler requires a `_work` that does the job, and every `_work` requires a `_done` to process its result.

> **NOTE:**
> Also it's important that the task function has to end with `_work` suffix and the completion function has to end with `_done` suffix. For example, the functions must be named like `something_work()` and `something_done()`.

- The **handler** is the entry point. It receives the `req` and `res` objects and starts the chain by calling only the first `_work` using the `async()` macro.
- The **_work()** function performs the actual async task. Once it completes, it returns either a success or failure result to the `_done` using `ok()` or `fail()`.
- The **_done()** function processes the result received from the `_work`. It then either sends a response to the client or triggers the next operation in the chain using the `await()` macro.

So, the async logic follows this flow:

```
handler() -> _work() -> _done()
```

In Ecewo, asynchronous operations work as chained from the bottom up. So our entry point —which is the **handler**— must be at the bottom.

If we imagine that we have 2 async operations in the chain, our `async` process will work as follows:

```c
// src/async_handler.c

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

The example will be a very basic calculator that receives a number from `req->params` and does an addition first, and then a multiplication. So we will write a chain that includes 2 async operations.

### Step 0: Install Async Plugin

```
ecewo install async
```

### Step 1: Create A Context Structure

```c
// src/async_handler.c

#include "ecewo.h"  // For our handler, which is the entry point
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

`Req *req` and `Res *res` must be in the struct everytime, we move their memory between the chains. The others are the variables we will use in the async operations.

### Step 2: Create An Entry Point

An entry point is our usual handler.

```c
// src/async_handler.c

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_params("num");

    // Converte it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));
    if (!ctx)
    {
        send_text(500, "Memory allocation failed");
        return;
    }

    // Copy Req and Res to heap
    ctx->req = malloc(sizeof(*ctx->req));
    ctx->res = malloc(sizeof(*ctx->res));

    if (!ctx->req || !ctx->res)
    {
        send_text(500, "Memory allocation failed");
        free(ctx->req);
        free(ctx->res);
        free(ctx);
        return;
    }

    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start chain: addition
    async(ctx, add);
}
```

The `async(ctx, add)` takes two parameters: First one is the context, second one is the name of `_work` and `_done` functions. So, our first async operation must be called as `add_work` and `add_done`, because we pass them as `async(ctx, add);` in this example.

### Step 3: Write The First Operation

```c
// src/async_handler.c

// _done function of the first operation:
static void add_done(void *context, int success, char *error)
{
    if (success)
    {
        await(context, multiply);
        // if success, "await" calls the next task named "multiply"
    }
    else
    {
        // Assign the context
        ctx_t *ctx = context;

        // Assign ctx->res to a local variable because the text() macro waits for 'res'
        Res *res = ctx->res;

        // Send a response
        send_text(500, error);

        // Free the allocated memories
        free(ctx->req);
        free(ctx->res);
        free(ctx);
    }
}

// _work function of the first operation:
static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // Add 10 to the input
    ctx->intermediate = ctx->input + 10;

    // Go to the _done function
    ok(task);
}
```

> A `_work` function must be defined after its corresponding `_done` function, since it needs to access or reference it.

### Step 4: Write The Second Operation

At the previously step, `add_done()` function called an operation named `multiply` by `await(context, multiply)` if the process is success. So let's write the `multiply` function.

```c
// src/async_handler.c

// _done function of the second operation:
static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *ctx = context;

    // Assign ctx->res to a local variable because the text() macro waits for 'res'
    Res *res = ctx->res;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        send_text(500, error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           ctx->input, ctx->final);

        send_text(200, buf);
    }

    // Ensure memory is always freed regardless of success/failure
    free(ctx->req);
    free(ctx->res);
    free(ctx);
}

// _work function of the second operation:
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
    Req *req;
    Res *res;
    long input;
    long intermediate;
    long final;
} ctx_t;

// _done function of the second operation:
static void multiply_done(void *context, int success, char *error)
{
    // Assign the context
    ctx_t *ctx = context;

    // Assign ctx->res to a local variable because the text() macro waits for 'res'
    Res *res = ctx->res;

    // If "multiply_work()" function returns an error
    if (!success)
    {
        send_text(500, error);
    }
    else
    {
        char buf[128];
        int len = snprintf(buf, sizeof(buf),
                           "((%ld) + 10) * 5 = %ld",
                           ctx->input, ctx->final);

        send_text(200, buf);
    }

    // Ensure memory is always freed regardless of success/failure
    free(ctx->req);
    free(ctx->res);
    free(ctx);
}

// _work function of the second operation:
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

// _done function of the first operation:
static void add_done(void *context, int success, char *error)
{
    if (success)
    {
        await(context, multiply);
        // if success, "await" calls the next task named "multiply"
    }
    else
    {
        // Assign the context
        ctx_t *ctx = context;

        // Assign ctx->res to a local variable because the text() macro waits for 'res'
        Res *res = ctx->res;

        // Send a response
        send_text(500, error);

        // Free the allocated memories
        free(ctx->req);
        free(ctx->res);
        free(ctx);
    }
}

// _work function of the first operation:
static void add_work(async_t *task, void *context)
{
    // Assign the context
    ctx_t *ctx = context;

    // Add 10 to the input
    ctx->intermediate = ctx->input + 10;

    // Go to the _done function
    ok(task);
}

// HTTP handler
void calculate(Req *req, Res *res)
{
    // Get the number from request params
    const char *num_str = get_params("num");

    // Convert it to a number
    long num = num_str ? strtol(num_str, NULL, 10) : 0;

    // Allocate memory for async
    ctx_t *ctx = malloc(sizeof(*ctx));
    if (!ctx)
    {
        send_text(500, "Memory allocation failed");
        return;
    }

    // Copy Req and Res to heap
    ctx->req = malloc(sizeof(*ctx->req));
    ctx->res = malloc(sizeof(*ctx->res));

    if (!ctx->req || !ctx->res)
    {
        send_text(500, "Memory allocation failed");
        free(ctx->req);
        free(ctx->res);
        free(ctx);
        return;
    }

    *ctx->req = *req;
    *ctx->res = *res;

    ctx->input = num;
    ctx->intermediate = 0;
    ctx->final = 0;

    // Start chain: addition
    async(ctx, add);
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
    ecewo(4000);
    final_router();
    return 0;
}
```

Now let's build by running these commands:

```
ecewo migrate
ecewo run
```

And go to `http://localhost:4000/calculate/100`. We will receive that response:

```
((100) + 10) * 5 = 550
```

If go to `http://localhost:4000/calculate/10000` now and we'll receive:

```
Intermediate too large to multiply
```
