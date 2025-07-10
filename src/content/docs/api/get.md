---
title: get()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`get()` is for receiving `GET` requests. It must be declared in `main` function.

```c
void get(const char *path, ...);
```

Example usage:

```c
get("/your/path", your_handler);
```
