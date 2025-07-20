---
title: shutdown_hook()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`shutdown_hook()` is a function that frees main memory before the server shuts down. It is responsible for freeing memory allocated by the server's itself, such as the router, middleware, database, session manager, CORS handler, and others.

```c
void shutdown_hook(void (*hook)(void));
```