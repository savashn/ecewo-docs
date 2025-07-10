---
title: post()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`post()` is for receiving `POST` requests. It must be declared in `main` function.

```c
void post(const char *path, ...);
```

Example usage:

```c
post("/your/path", your_handler);
```
