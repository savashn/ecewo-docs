---
title: shutdown_hook()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`shutdown_hook()` is a function that frees main memory before the server shuts down. It is responsible for freeing memory allocated by the server's itself, such as the router, middleware, database, session manager, CORS handler, and others.

```c
void shutdown_hook(void (*hook)(void));
```

Example usage:

```c
// main.c

void destroy_app()
{
    close_db();
    reset_sessions();
    reset_middleware();
    reset_router();
    reset_cors();
}

int main()
{
    cors_t cors = {
        .origin = "*",
        .headers = "Content-Type, Authorization",
        .credentials = "true",
    };

    init_cors(&cors);
    init_router();
    init_sessions();
    init_db();

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```