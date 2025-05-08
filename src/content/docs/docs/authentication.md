---
title: Authentication
description: Documentation of Ecewo — A modern microframework for web development in C
---

Ecewo offers some session management APIs for authentication and authorization:

- `set_cookie()` to set cookie
- `create_session()` to create a session
- `find_session()` to find a session in memory
- `get_session()` to get the session from request
- `free_session()` to delete the session from memory

With the power of these APIs and cJSON, we can easily manage the authentication and authorization.

Let's make an authentication example and see how it works.

## Login

We have two test users:

```
    [
        {
            "id": 1,
            "name": "John",
            "username": "johndoe"
            "password": "123123123"
        },
        {
            "id": 2,
            "name": "Jane",
            "username": "janedoe"
            "password": "123123123"
        }
    ]
```

Let's write a `login` handler:

```sh
// src/handlers/handlers.c

#include "router.h"
#include "jansson.h"
#include "session.h"
#include "../db/db.h"

extern sqlite3 *db;

void handle_login(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing request body");
        return;
    }

    json_error_t err;
    json_t *json = json_loads(body, 0, &err);
    if (!json)
    {
        reply(res, "400 Bad Request", "text/plain", "Invalid JSON");
        return;
    }

    // username ve password alanlarını al
    json_t *j_username = json_object_get(json, "username");
    json_t *j_password = json_object_get(json, "password");

    if (!json_is_string(j_username) || !json_is_string(j_password))
    {
        json_decref(json);
        reply(res, "400 Bad Request", "text/plain", "Missing or invalid fields");
        return;
    }

    const char *username = json_string_value(j_username);
    const char *password = json_string_value(j_password);

    const char *sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);
    if (rc != SQLITE_OK)
    {
        json_decref(json);
        reply(res, "500 Internal Server Error", "text/plain", "DB prepare failed");
        return;
    }

    sqlite3_bind_text(stmt, 1, username, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, password, -1, SQLITE_STATIC);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW)
    {
        const char *db_name = (const char *)sqlite3_column_text(stmt, 1);

        char *sid = create_session();
        Session *sess = find_session(sid);

        set_session(sess, "name", db_name);
        set_session(sess, "username", username);
        set_session(sess, "theme", "dark");

        set_cookie(res, "session_id", sid, 3600);

        printf("Session ID: %s\n", sid);
        printf("Session JSON: %s\n", sess->data);

        reply(res, "200 OK", "text/plain", "Login successful!");
    }
    else
    {
        reply(res, "401 Unauthorized", "text/plain", "Invalid username or password");
    }

    sqlite3_finalize(stmt);
    json_decref(json);
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void handle_login(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers/handlers.h"
#include "db/db.h"

int main()
{
    init_db();
    post("/login", handle_login);
    ecewo(4000);
    sqlite3_close(db);
    return 0;
}
```

Let's send a request to `http://localhost:4000/login` with that body:

```
{
    "username": "janedoe",
    "password": "321321"
}
```

If login is successful, we'll see a **"Login successful!"** response and a header like `"Cookie": "session_id=VKdbMRbqMhh_40F6ef2FreEba6JqkH16"` will be added to the headers.

## Logout

We also write a logout handler to use after login. Let's add these parts:

```sh
// src/handlers/handlers.c

// Add this handler:

void handle_logout(Req *req, Res *res)
{
    // First, check if the user has session
    Session *sess = get_session(&req->headers);

    if (!sess)
    {
        reply(res, "400", "text/plain", "You have to login first");
    }
    else
    {
        free_session(sess);                   // Delete session from the memory
        set_cookie(res, "session_id", "", 0); // Time out cookie, the browser will delete it
        reply(res, "302 Found", "text/plain", "Logged out");
    }
}
```

Declare the logout handler too:

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res); // We added now

#endif
```

And also add to entry point:

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers/handlers.h"
#include "db/db.h"

int main()
{
    init_db();
    post("/login", handle_login);
    get("/logout", handle_logout); // We added it now
    ecewo(4000);
    sqlite3_close(db);
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

## Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```sh
// src/handlers/handlers.c

#include "router.h"
#include "cjson.h"
#include "session.h"

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        reply(res,
              "401 Unauthorized",
              "application/json",
              "{\"error\":\"Authentication required\"}");
        return;
    }

    /* Parse the JSON string stored in session->data */
    json_error_t err;
    json_t *session_data = json_loads(user_session->data, 0, &err);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        reply(res,
              "500 Internal Server Error",
              "application/json",
              "{\"error\":\"Failed to parse session data\"}");
        return;
    }

    /* Serialize back to a compact JSON string */
    char *session_str = json_dumps(session_data, JSON_COMPACT);
    if (!session_str)
    {
        json_decref(session_data);
        reply(res,
              "500 Internal Server Error",
              "application/json",
              "{\"error\":\"Failed to serialize session data\"}");
        return;
    }

    /* Send the session JSON back to the client */
    reply(res, "200 OK", "application/json", session_str);

    /* Clean up */
    free(session_str);
    json_decref(session_data);
}
```

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res);
void handle_session_data(Req *req, Res *res); // We added now

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers.h"
#include "db.h"

int main()
{
    init_db();
    get("/session", handle_session_data); // We added it now
    post("/login", handle_login);
    post("/logout", handle_logout);
    ecewo(4000);
    sqlite3_close(db);
    return 0;
}
```

First, we need to login. Rebuild the program and send a `POST` request to the `http://localhost:4000/login` and get the session.
After that, send another request to the `http://localhost:4000/session` address to see the session data.
The output will this:

```
{
    "name": "John",
    "username": "johndoe",
    "theme": "dark"
}
```

Here are the session data, which we have added while the user is logging in.

If you don't want the whole session data, but just one or two, you can do it as well:

```sh
// src/handlers/handlers.c

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        reply(res,
              "401 Unauthorized",
              "application/json",
              "{\"error\":\"Authentication required\"}");
        return;
    }

    /* Parse stored session JSON */
    json_error_t err;
    json_t *session_data = json_loads(user_session->data, 0, &err);
    if (!session_data)
    {
        reply(res,
              "500 Internal Server Error",
              "application/json",
              "{\"error\":\"Invalid session data\"}");
        return;
    }

    /* Extract \"name\" field */
    json_t *j_name = json_object_get(session_data, "name");

    /* Build response object */
    json_t *response = json_object();
    if (json_is_string(j_name))
    {
        json_object_set_new(response, "name", json_string(json_string_value(j_name)));
    }
    else
    {
        json_object_set_new(response, "name", json_string("Unknown"));
    }

    /* Serialize response */
    char *json_str = json_dumps(response, JSON_COMPACT);
    if (!json_str)
    {
        json_decref(session_data);
        json_decref(response);
        reply(res,
              "500 Internal Server Error",
              "application/json",
              "{\"error\":\"Failed to serialize response\"}");
        return;
    }

    /* Send it */
    reply(res, "200 OK", "application/json", json_str);

    /* Cleanup */
    free(json_str);
    json_decref(session_data);
    json_decref(response);
}
```

The output will be:

```
{
    "name": "John"
}
```

## Protected Routes

Let's say that we want some pages to be available for authenticated users only. In this situation, we can use `get_session()` function to check if the user has a session.

```sh
// src/handlers/handlers.c

void handle_protected(Req *req, Res *res)
{
     // Check if the user has session
    Session *sess = get_session(&req->headers);

     // If the user hasn't, return an error with 401 status code
    if (!sess)
    {
        reply(res, "401 Unauthorized", "text/plain", "You must be logged in.");
        return;
    }

    // If has, let the user in
    reply(res, "200 OK", "text/plain", "Welcome to the protected area!");
}
```

```sh
// src/handlers/handlers.h

void handle_protected(Req *req, Res *res);
```

```sh
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

```sh
// src/main.c

int main()
{
    // <-- Some other codes -->

    get("/edit/:slug", edit_profile);

    // <-- Some other codes -->
}
```

```sh
// src/handlers/handlers.h

void edit_profile(Req *req, Res *res);
```

```sh
// src/handlers/handlers.c

void edit_profile(Req *req, Res *res)
{
    // First, check the user's session
    Session *sess = get_session(&req->headers);
    if (!sess)
    {
        reply(res,
              "401 Unauthorized",
              "text/plain",
              "Authentication required");
        return;
    }

    // Parse session data as JSON with Jansson
    json_error_t err;
    json_t *session_data = json_loads(sess->data, 0, &err);
    if (!session_data)
    {
        reply(res,
              "500 Internal Server Error",
              "text/plain",
              "Invalid session data");
        return;
    }

    /* Extract \"username\" field from session */
    json_t *j_username = json_object_get(session_data, "username");
    if (!json_is_string(j_username))
    {
        json_decref(session_data);
        reply(res,
              "500 Internal Server Error",
              "text/plain",
              "Session missing username");
        return;
    }
    const char *session_username = json_string_value(j_username);

    /* Compare slug param vs session username */
    const char *slug = get_req(&req->params, "slug");
    if (!slug || strcmp(slug, session_username) != 0)
    {
        json_decref(session_data);
        reply(res,
              "403 Forbidden",
              "text/plain",
              "Unauthorized: Slug does not match session username");
        return;
    }

    /* Prepare and run SQL */
    const char *sql = "SELECT id, name FROM users WHERE username = ?;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, NULL);
    if (rc != SQLITE_OK)
    {
        const char *errmsg = sqlite3_errmsg(db);
        char error_msg[256];
        snprintf(error_msg, sizeof(error_msg),
                 "{\"error\":\"DB error: %s\"}", errmsg);
        json_decref(session_data);
        reply(res, "500 Internal Server Error", "application/json", error_msg);
        return;
    }
    sqlite3_bind_text(stmt, 1, slug, -1, SQLITE_STATIC);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW)
    {
        int id = sqlite3_column_int(stmt, 0);
        const char *name = (const char *)sqlite3_column_text(stmt, 1);

        /* Build JSON response with Jansson */
        json_t *user_json = json_object();
        json_object_set_new(user_json, "id", json_integer(id));
        json_object_set_new(user_json, "name", json_string(name));

        char *json_string = json_dumps(user_json, JSON_COMPACT);
        reply(res, "200 OK", "application/json", json_string);

        free(json_string);
        json_decref(user_json);
    }
    else
    {
        reply(res,
              "404 Not Found",
              "text/plain",
              "User not found");
    }

    /* Cleanup */
    sqlite3_finalize(stmt);
    json_decref(session_data);
    free_req(&req->params);
}
```

Let's send 3 different request to the `http://localhost:4000/edit/johndoe` route.

If we try without any authorization, we'll get that response:

```sh
{
    Authentication required
}
```

If we try to reach that page as someone who is not johndoe, we'll receive:

```sh
{
    Unauthorized: Slug does not match session username
}
```

When we logged in as johndoe and send a request again, here is what we will get:

```sh
{
    "id": 1,
    "name": "John"
}
```

## Notes

** **NOTE 1** **

It's not safe to insert the password to the database without encryption. You should use a library to encrypt the user password before inserting.

** **NOTE 2** **

In these examples, session is stored in memory, but you can store them in the database if you prefer.

If you store them in the memory, you will use `free_session()` API for rare operations like logout. Ecewo will free the expired sessions when a new session is created.

But if you prefer storing the sessions in a database, you may free the session from memory right after you create and insert it into the database.
