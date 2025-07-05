---
title: Using JWT
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We can use [l8w8jwt](https://github.com/GlitchedPolygons/l8w8jwt) for authentication with JWT.

There are [basic examples](https://github.com/GlitchedPolygons/l8w8jwt?tab=readme-ov-file#examples) in the GitHub page of `l8w8jwt`. We'll do the same examples in our Ecewo project:

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void encoding_handler(Req *req, Res *res);
void decoding_handler(Req *req, Res *res);

#endif
```

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
  init_router();

  get("/decode", decoding_handler);
  get("/encode", encoding_handler);

  ecewo(3000);
  reset_router();
  return 0;
}
```

```c
// src/handlers.c

#include "handlers.h"
#include "l8w8jwt/encode.h"
#include "l8w8jwt/decode.h"

static const char KEY[] = "YoUR sUpEr S3krEt 1337 HMAC kEy HeRE";
static const char JWT[] = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODA5MzczMjksImV4cCI6MTU4MDkzNzkyOSwic3ViIjoiR29yZG9uIEZyZWVtYW4iLCJpc3MiOiJCbGFjayBNZXNhIiwiYXVkIjoiQWRtaW5pc3RyYXRvciJ9.7oNEgWxzs4nCtxOgiyTofP2bxZtL8dS7hgGXRPPDmwQWN1pjcwntsyK4Y5Cr9035Ro6Q16WOLiVAbj7k7TeCDA";

void encoding_handler(Req *req, Res *res)
{
    char *jwt;
    size_t jwt_length;

    struct l8w8jwt_encoding_params params;
    l8w8jwt_encoding_params_init(&params);

    params.alg = L8W8JWT_ALG_HS512;

    params.sub = "Gordon Freeman";
    params.iss = "Black Mesa";
    params.aud = "Administrator";

    params.iat = l8w8jwt_time(NULL);
    params.exp = l8w8jwt_time(NULL) + 600; /* Set to expire after 10 minutes (600 seconds). */

    params.secret_key = (unsigned char *)"YoUR sUpEr S3krEt 1337 HMAC kEy HeRE";
    params.secret_key_length = strlen(params.secret_key);

    params.out = &jwt;
    params.out_length = &jwt_length;

    int r = l8w8jwt_encode(&params);

    printf("\n l8w8jwt example HS512 token: %s \n", r == L8W8JWT_SUCCESS ? jwt : " (encoding failure) ");

    /* Always free the output jwt string! */
    l8w8jwt_free(jwt);

    send_text(res, 200, "Success!");
}

void decoding_handler(Req *req, Res *res)
{
    struct l8w8jwt_decoding_params params;
    l8w8jwt_decoding_params_init(&params);

    params.alg = L8W8JWT_ALG_HS512;

    params.jwt = (char *)JWT;
    params.jwt_length = strlen(JWT);

    params.verification_key = (unsigned char *)KEY;
    params.verification_key_length = strlen(KEY);

    /*
     * Not providing params.validate_iss_length makes it use strlen()
     * Only do this when using properly NUL-terminated C-strings!
     */
    params.validate_iss = "Black Mesa";
    params.validate_sub = "Gordon Freeman";

    /* Expiration validation set to false here only because the above example token is already expired! */
    params.validate_exp = 0;
    params.exp_tolerance_seconds = 60;

    params.validate_iat = 1;
    params.iat_tolerance_seconds = 60;

    enum l8w8jwt_validation_result validation_result;

    int decode_result = l8w8jwt_decode(&params, &validation_result, NULL, NULL);

    if (decode_result == L8W8JWT_SUCCESS && validation_result == L8W8JWT_VALID)
    {
        printf("\n Example HS512 token validation successful! \n");
    }
    else
    {
        printf("\n Example HS512 token validation failed! \n");
    }

    /*
     * decode_result describes whether decoding/parsing the token succeeded or failed;
     * the output l8w8jwt_validation_result variable contains actual information about
     * JWT signature verification status and claims validation (e.g. expiration check).
     *
     * If you need the claims, pass an (ideally stack pre-allocated) array of struct l8w8jwt_claim
     * instead of NULL,NULL into the corresponding l8w8jwt_decode() function parameters.
     * If that array is heap-allocated, remember to free it yourself!
     */

    send_text(res, 200, "Success!");
}
```

Rebuild the project and send two different requests. First one is `http://localhost:3000/encode`. We'll receive a `Success!` response and there will be a token in the terminal:

```
l8w8jwt example HS512 token: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDg4NjEyMjgsImV4cCI6MTc0ODg2MTgyOCwic3ViIjoiR29yZG9uIEZyZWVtYW4iLCJpc3MiOiJCbGFjayBNZXNhIiwiYXVkIjoiQWRtaW5pc3RyYXRvciJ9.nVuPVFtW3DqCI-XQDvBWG_OfvuDH6Tt_MR7f72Dpq8sztkTWs6pO6OJDh_3Eeh5xbVLqbTxiXILPCfo6NkgCwA
```

Now let's send a request to `http://localhost:3000/decode` for decoding. We'll receive a `Success!` response again and see that in the terminal:

```
Example HS512 token validation successful!
```
