---
title: send_cbor()
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

`send_cbor()` is a macro for sending `application/cbor` responses easily. It runs [reply()](/api/reply) function under the hood.

You need to pass these parameters:
- The Res object
- Status code
- CBOR response body
- Length of the CBOR response body

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