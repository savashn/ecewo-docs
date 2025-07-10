---
title: del()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`del()` is for receiving `DELETE` requests. It must be declared in `main` function.

```c
void del(const char *path, ...);
```

Example usage:

```c
del("/your/path", your_handler);
```
