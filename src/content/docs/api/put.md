---
title: put()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`put()` is for receiving `PUT` requests. It must be declared in `main` function.

```c
void put(const char *path, ...);
```

Example usage:

```c
put("/your/path", your_handler);
```
