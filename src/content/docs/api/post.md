---
title: post()
description: Minimalist and easy-to-use C web framework
---

`post()` is for receiving `POST` requests. It must be declared in `main` function.

```c
void post(const char *path, ...);
```

Example usage:

```c
post("/your/path", your_handler);
```
