---
title: put()
description: Minimalist and easy-to-use C web framework
---

`put()` is for receiving `PUT` requests. It must be declared in `main` function.

```c
void put(const char *path, ...);
```

Example usage:

```c
put("/your/path", your_handler);
```
