---
title: get()
description: Minimalist and easy-to-use C web framework
---

`get()` is for receiving `GET` requests. It must be declared in `main` function.

```c
void get(const char *path, ...);
```

Example usage:

```c
get("/your/path", your_handler);
```
