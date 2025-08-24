---
title: send_cbor()
description: Minimalist and easy-to-use C web framework
---

`send_cbor()` is for sending `application/cbor` responses easily. It runs [reply()](/api/reply) function under the hood.

```c
static inline void send_cbor(Res *res, int status, const char *body, size_t body_len)
{
    reply(res, status, "application/cbor", body, body_len);
}
```

Example usage:

```c
#include "ecewo.h"

void hello_world(Req *req, Res *res)
{
    // ...
    // Some codes...
    // ...

    send_cbor(res, 200, buffer, len);
}
```

See [Using CBOR](/examples/using-cbor/) chapter.
