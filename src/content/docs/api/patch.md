---
title: patch()
description: Minimalist and easy-to-use C web framework
---

`patch()` is for receiving `PATCH` requests. It must be declared in `main` function.

```c
void patch(const char *path, ...);
```

Example usage:

```c
patch("/your/path", your_handler);
```
