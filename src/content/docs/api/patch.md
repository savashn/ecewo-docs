---
title: patch()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`patch()` is for receiving `PATCH` requests. It must be declared in `main` function.

```c
void patch(const char *path, ...);
```

Example usage:

```c
patch("/your/path", your_handler);
```
