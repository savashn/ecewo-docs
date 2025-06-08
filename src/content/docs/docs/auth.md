---
title: Authentication and Authorization
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

## Cookies

Ecewo offers a `cookie` plugin to get or set a cookie:
- `get_cookie()` to get the `Cookie` header
- `set_cookie()` to set a `Cookie` header.

### Install Cookie Plugin

```
ecewo install cookie
```

### Usage

Let's create three new routes. One for setting a cookie, one for getting the cookie, and one for getting all the cookies:

```c
// src/main.c

#include "server.h"
#include "handlers.h"

int main()
{
    init_router();

    get("/set-cookie", set_cookie_handler);
    get("/get-cookie", get_cookie_handler);
    get("/all-cookies", get_all_cookies);

    ecewo(4000);
    final_router();
    return 0;
}
```

```c
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void set_cookie_handler(Req *req, Res *res);
void get_cookie_handler(Req *req, Res *res);
void get_all_cookies(Req *req, Res *res);

#endif
```

```c
// src/handlers.c

#include "handlers.h"
#include "cookie.h"

void set_cookie_handler(Req *req, Res *res)
{
    set_cookie("theme", "dark", 3600); // 1 hour
    set_cookie("name", "john", 7200);  // 2 hour
    send_text(200, "Cookies sent!");
}

void get_cookie_handler(Req *req, Res *res)
{
    char *theme = get_cookie("theme");

    if (!theme)
    {
        send_text(404, "Cookies not found");
        return;
    }

    send_text(200, theme);
    free(theme);
}

void get_all_cookies(Req *req, Res *res)
{
    const char *cookies = get_headers("Cookie");

    if (!cookies)
    {
        send_text(404, "No cookies found");
        return;
    }

    send_text(200, cookies);
}
```

`get_cookie()` actually runs `get_headers()` under the hood, and it searchs the `Cookie` header only. Remember, you have to free its memory after you use.

When we send a request to `http://localhost:4000/set-cookie` via POSTMAN, we'll receive a `Cookies sent!` response. If we then check the `Cookies` tab, we'll see the two cookies that were sent.

Let's send a response to `http://localhost:4000/all-cookies` to check the cookies that were sent. When we send the request, the response we get should be `name=john; theme=dark`.

If we want to get a specific cookie only, we can use `get_cookie()` like shown in the example. Let's send another request to `http://localhost:4000/get-cookie`, and we'll get the response `dark`.

## Sessions

Ecewo offers some session management APIs for authentication and authorization:

- `create_session()` to create a session
- `find_session()` to find a session in memory
- `get_session()` to get the session from request
- `free_session()` to delete the session from memory

With the power of these APIs, we can easily manage the authentication and authorization.

Let's make an authentication example and see how it works.

### Install Session Plugin

Run this command in the terminal:

```
ecewo install cookie session
```

Since `session` depends on `cookie` plugin, we also need to install it if we didn't yet.

### Login

Let's write a `login` handler:

```c
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);

#endif
```

```c
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "session.h"

// Example user info (it must be saved in a database)
const char *STATIC_NAME = "John Doe";
const char *STATIC_USERNAME = "johndoe";
const char *STATIC_PASSWORD = "123123";
const int STATIC_USER_ID = 1;

void handle_login(Req *req, Res *res)
{
  const char *body = req->body;
  if (!body)
  {
    send_text(400, "Missing request body");
    return;
  }

  cJSON *json = cJSON_Parse(body);
  if (!json)
  {
    send_text(400, "Invalid JSON");
    return;
  }

  const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
  const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

  if (!username || !password)
  {
    cJSON_Delete(json);
    send_text(400, "Missing fields");
    return;
  }

  if (strcmp(username, STATIC_USERNAME) == 0 && strcmp(password, STATIC_PASSWORD) == 0)
  {
    char *sid = create_session(3600);   // 1 hour
    Session *sess = find_session(sid);

    set_session(sess, "name", STATIC_NAME);
    set_session(sess, "username", STATIC_USERNAME);
    set_session(sess, "theme", "dark");

    set_cookie("session_id", sid, 3600);    // 1 hour

    printf("Session ID: %s\n", sid);
    printf("Session JSON: %s\n", sess->data);

    send_text(200, "Login successful!");
  }
  else
  {
    send_text(401, "Invalid username or password");
  }

  cJSON_Delete(json);
}

```

```c
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "session.h"

int main()
{
    init_router();
    init_sessions();

    post("/login", handle_login);

    ecewo(4000);

    final_sessions();
    final_router();

    return 0;
}
```

Let's send a request to `http://localhost:4000/login` with that body:

```json
{
    "username": "johndoe",
    "password": "123123"
}
```

If login is successful, we'll see a **"Login successful!"** response and a header like `"Cookie": "session_id=VKdbMRbqMhh_40F6ef2FreEba6JqkH16"` will be added to the headers.

### Logout

We also write a logout handler to use after login. Let's add these parts:

```c
// src/handlers/handlers.c

// Add this handler:

void handle_logout(Req *req, Res *res)
{
    // First, check if the user has session
    Session *sess = get_session(&req->headers);

    if (!sess)
    {
        send_text(400, "You have to login first");
    }
    else
    {
        free_session(sess); // Delete session from the memory
        set_cookie("session_id", "", 0); // Time out cookie, the browser will delete it
        send_text(302, "Logged out");
    }
}
```

Declare the logout handler too:

```c
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res); // We added now

#endif
```

And also add to entry point:

```c
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "session.h"

int main()
{
    init_router();
    init_sessions();

    post("/login", handle_login);
    get("/logout", handle_logout); // We added it now

    ecewo(4000);

    final_sessions();
    final_router();

    return 0;
}
```

Now let's send a request to `http://localhost:4000/logout` after login. `Cookie` header will be deleted and we'll see that response:

```
Logged out
```

If we send one more request, we'll see:

```
You have to login first
```

> **WHAT'S THE DIFFERENCE BETWEEN `get_cookie()` and `get_session()`?**
>
> `get_session()` is running `get_cookie()` under the hood, but it's specialized to extract the `session_id` from the `Cookie` header. While you need to manually free the memory returned by `get_cookie()`, you don't need to do that with `get_session()` — it handles memory management internally.

### Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```c
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res);
void handle_session_data(Req *req, Res *res); // We added now

#endif
```

```c
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "session.h"

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        send_text(401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        send_text(500, "Error: Failed to parse session data");
        return;
    }

    /* Serialize back to a compact JSON string */
    char *session_str = cJSON_PrintUnformatted(session_data);
    if (!session_str)
    {
        cJSON_Delete(session_data);
        send_text(500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    send_json(200, session_str);

    /* Clean up */
    free(session_str);
    cJSON_Delete(session_data);
}
```

```c
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "session.h"

int main()
{
    init_router();
    init_sessions();

    get("/session", handle_session_data); // We added it now
    post("/login", handle_login);
    post("/logout", handle_logout);

    ecewo(4000);

    final_sessions();
    final_router();
    
    return 0;
}
```

First, we need to login. Rebuild the program and send a `POST` request to the `http://localhost:4000/login` and get the session.
After that, send another request to the `http://localhost:4000/session` address to see the session data.
The output will this:

```json
{
    "name": "John",
    "username": "johndoe",
    "theme": "dark"
}
```

Here are the session data, which we have added while the user is logging in.

If you don't want the whole session data, but just one or two, you can do it as well:

```c
// src/handlers/handlers.c

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        send_text(401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        send_text(500, "Error: Failed to parse session data");
        return;
    }

    cJSON *name = cJSON_GetObjectItem(session_data, "name");

    cJSON *response = cJSON_CreateObject();

    if (name && name->valuestring)
    {
        cJSON_AddStringToObject(response, "name", name->valuestring);
    }
    else
    {
        cJSON_AddStringToObject(response, "name", "Unknown");
    }

    char *json_str = cJSON_PrintUnformatted(response);
    if (!json_str)
    {
        cJSON_Delete(session_data);
        send_text(500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    send_json(200, json_str);

    /* Clean up */
    free(json_str);
    cJSON_Delete(session_data);
    cJSON_Delete(response);
}
```

The output will be:

```json
{
    "name": "John"
}
```

### Protected Routes

Let's say that we want some pages to be available for authenticated users only. In this situation, we can use `get_session()` function to check if the user has a session.

```c
// src/handlers/handlers.h

void handle_protected(Req *req, Res *res);
```

```c
// src/handlers/handlers.c

void handle_protected(Req *req, Res *res)
{
     // Check if the user has session
    Session *sess = get_session(&req->headers);

     // If the user hasn't, return an error with 401 status code
    if (!sess)
    {
        send_text(401, "You must be logged in.");
        return;
    }

    // If has, let the user in
    send_text(200, "Welcome to the protected area!");
}
```

```c
// src/main.c

get("/protected", handle_protected);
```

Let's send a request to `http://localhost:4000/protected`. If we authenticated, we'll see:

```
Welcome to the protected area!
```

If we did not, we'll see:

```
You must be logged in.
```

Well, some routes should be for the user's himself only such as Edit Profile page. In that situation, we need to think deeper.
For this example, we'll define a route with `slug` and we'll check first if the username in session data and slug is the same.
If they are, then we'll run a sql query and send a response.

```c
// src/main.c

int main()
{
    // <-- Some other codes -->

    get("/edit/:slug", edit_profile);

    // <-- Some other codes -->
}
```

```c
// src/handlers/handlers.h

void edit_profile(Req *req, Res *res);
```

```c
// src/handlers/handlers.c

// Example user info (it must be saved in a database)
const char *STATIC_NAME = "John Doe";
const char *STATIC_USERNAME = "johndoe";
const char *STATIC_PASSWORD = "123123123";
const int STATIC_USER_ID = 1;

void edit_profile(Req *req, Res *res)
{
  Session *sess = get_session(&req->headers);
  if (!sess)
  {
    send_text(401, "Authentication required");
    return;
  }

  cJSON *session_data = cJSON_Parse(sess->data);
  if (!session_data)
  {
    send_text(500, "Invalid session data");
    return;
  }

  const cJSON *username = cJSON_GetObjectItem(session_data, "username");
  const char *slug = get_params("slug");

  if (!slug || strcmp(slug, username->valuestring) != 0)
  {
    cJSON_Delete(session_data);
    send_text(403, "Unauthorized: Slug does not match session username");
    return;
  }

  if (strcmp(slug, STATIC_USERNAME) == 0)
  {
    cJSON *user_json = cJSON_CreateObject();
    cJSON_AddNumberToObject(user_json, "id", STATIC_USER_ID);
    cJSON_AddStringToObject(user_json, "name", STATIC_NAME);

    char *json_string = cJSON_PrintUnformatted(user_json);
    send_json(200, json_string);

    cJSON_Delete(user_json);
    free(json_string);
  }
  else
  {
    send_text(404, "User not found");
  }

  cJSON_Delete(session_data);
}
```

Let's send 3 different request to the `http://localhost:4000/edit/johndoe` route.

If we try without any authorization, we'll get that response:

```
    Authentication required
```

If we try to reach that page as someone who is not johndoe, we'll receive:

```
    Unauthorized: Slug does not match session username
```

When we logged in as johndoe and send a request again, here is what we will get:

```json
{
    "id": 1,
    "name": "John"
}
```

### Notes

> **NOTE 1**
>
>It's not safe to insert the password to the database without encryption. You should use a library to encrypt the user password before inserting.

> **NOTE 2**
>
>In these examples, session is stored in memory, but you can store them in the database if you prefer.
>
>If you store them in the memory, you will use `free_session()` API for rare operations like logout. Ecewo will free the expired sessions when a new session is created.
>
>But if you prefer storing the sessions in a database, you may free the session from memory right after you create and insert it into the database.

## JWT

We can use [l8w8jwt](https://github.com/GlitchedPolygons/l8w8jwt) for authentication with JWT.

### Install JWT Plugin

Run these commands in the terminal:

```shell
git init
ecewo install l8w8jwt
```

It will add the JWT library as a GitHub submodule, as recommended.

### Using JWT

There are [basic examples](https://github.com/GlitchedPolygons/l8w8jwt?tab=readme-ov-file#examples) in the GitHub page of `l8w8jwt`. We'll do the same examples in Ecewo server:

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

  ecewo(4000);
  final_router();
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

    send_text(200, "Success!");
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

    send_text(200, "Success!");
}
```

### Test JWT

First, we need to migrate our `CMakeLists.txt` before the building:

```
ecewo migrate
```

And then, build our server running the following command:

```
ecewo run
```

Now we'll send two different requests. First one is `http://localhost:4000/encode`. We'll receive a `Success!` response and there will be a token in the terminal:

```
l8w8jwt example HS512 token: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDg4NjEyMjgsImV4cCI6MTc0ODg2MTgyOCwic3ViIjoiR29yZG9uIEZyZWVtYW4iLCJpc3MiOiJCbGFjayBNZXNhIiwiYXVkIjoiQWRtaW5pc3RyYXRvciJ9.nVuPVFtW3DqCI-XQDvBWG_OfvuDH6Tt_MR7f72Dpq8sztkTWs6pO6OJDh_3Eeh5xbVLqbTxiXILPCfo6NkgCwA
```

Now let's send a request to `http://localhost:4000/decode` for decoding. We'll receive a `Success!` response again and see that in the terminal:

```
Example HS512 token validation successful!
```
