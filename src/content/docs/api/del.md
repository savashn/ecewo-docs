---
title: del()
description: Minimalist and easy-to-use C web framework
---

`del()` is for receiving `DELETE` requests. It must be declared in `main` function.

```c
void del(const char *path, ...);
```

Example usage:

```c
del("/your/path", your_handler);
```
