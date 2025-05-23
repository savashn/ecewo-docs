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

With the power of these APIs, we can easily manage the authentication and authorization.

Let's make an authentication example and see how it works.

## Installation

Run this command in the terminal:

```
./ecewo.sh --install --session
```

For PowerShell:
```
./ecewo.bat /install --session
```

## Login

We have two test users:

```
    [
        {
            "id": 1,
            "name": "John",
            "username": "johndoe"
            "password": "123123"
        },
        {
            "id": 2,
            "name": "Jane",
            "username": "janedoe"
            "password": "321321"
        }
    ]
```

Let's write a `login` handler:

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);

#endif
```

```sh
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "session.h"
#include "../db/db.h"

extern sqlite3 *db;

void handle_login(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        text(400, "Missing request body");
        return;
    }

    cJSON *json = cJSON_Parse(body);
    if (!json)
    {
        text(400, "Invalid JSON");
        return;
    }

    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
    const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

    if (!username || !password)
    {
        cJSON_Delete(json);
        text(400, "Missing fields");
        return;
    }

    const char *sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);
    if (rc != SQLITE_OK)
    {
        cJSON_Delete(json);
        text(500, "DB prepare failed");
        return;
    }

    sqlite3_bind_text(stmt, 1, username, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, password, -1, SQLITE_STATIC);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW)
    {
        const char *db_name = (const char *)sqlite3_column_text(stmt, 1);

        char *sid = create_session(3600); // 1 hour
        Session *sess = find_session(sid);

        set_session(sess, "name", db_name);
        set_session(sess, "username", username);
        set_session(sess, "theme", "dark");

        set_cookie(res, "session_id", sid, 3600); // 1 hour

        printf("Session ID: %s\n", sid);
        printf("Session JSON: %s\n", sess->data);

        text(200, "Login successful!");
    }
    else
    {
        text(401, "Invalid username or password");
    }

    sqlite3_finalize(stmt);
    cJSON_Delete(json);
}
```

```sh
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "db/db.h"
#include "session.h"

int main()
{
    init_router();
    init_db();
    init_sessions();

    post("/login", handle_login);

    ecewo(4000);

    final_sessions();
    sqlite3_close(db);
    final_router();

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
        text(400, "You have to login first");
    }
    else
    {
        free_session(sess);                   // Delete session from the memory
        set_cookie(res, "session_id", "", 0); // Time out cookie, the browser will delete it
        text(302, "Logged out");
    }
}
```

Declare the logout handler too:

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res); // We added now

#endif
```

And also add to entry point:

```sh
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "db/db.h"
#include "session.h"

int main()
{
    init_router();
    init_db();
    init_sessions();

    post("/login", handle_login);
    get("/logout", handle_logout); // We added it now

    ecewo(4000);

    final_sessions();
    sqlite3_close(db);
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

## Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void handle_login(Req *req, Res *res);
void handle_logout(Req *req, Res *res);
void handle_session_data(Req *req, Res *res); // We added now

#endif
```

```sh
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "session.h"

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        text(401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        text(500, "Error: Failed to parse session data");
        return;
    }

    /* Serialize back to a compact JSON string */
    char *session_str = cJSON_PrintUnformatted(session_data);
    if (!session_str)
    {
        cJSON_Delete(session_data);
        text(500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    json(200, session_str);

    /* Clean up */
    free(session_str);
    cJSON_Delete(session_data);
}
```

```sh
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "db/db.h"
#include "session.h"

int main()
{
    init_router();
    init_db();
    init_sessions();

    get("/session", handle_session_data); // We added it now
    post("/login", handle_login);
    post("/logout", handle_logout);

    ecewo(4000);

    final_sessions();
    sqlite3_close(db);
    final_router();
    
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
        text(401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        text(500, "Error: Failed to parse session data");
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
        text(500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    json(200, json_str);

    /* Clean up */
    free(json_str);
    cJSON_Delete(session_data);
    cJSON_Delete(response);
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
// src/handlers/handlers.h

void handle_protected(Req *req, Res *res);
```

```sh
// src/handlers/handlers.c

void handle_protected(Req *req, Res *res)
{
     // Check if the user has session
    Session *sess = get_session(&req->headers);

     // If the user hasn't, return an error with 401 status code
    if (!sess)
    {
        text(401, "You must be logged in.");
        return;
    }

    // If has, let the user in
    text(200, "Welcome to the protected area!");
}
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
        text(401, "Authentication required");
        return;
    }

    // Parse session data as JSON with Jansson
    cJSON *session_data = cJSON_Parse(sess->data);
    if (!session_data)
    {
        text(500, "Invalid session data");
        return;
    }

    /* Extract \"username\" field from session */
    cJSON *username = cJSON_GetObjectItem(session_data, "username"); // Get the "username" data from session

    /* Compare slug param vs session username */
    const char *slug = get_req(&req->params, "slug");
    if (!slug || strcmp(slug, username->valuestring) != 0)
    {
        cJSON_Delete(session_data);
        text(403, "Unauthorized: Slug does not match session username");
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
        cJSON_Delete(session_data);
        json(500, error_msg);
        return;
    }
    sqlite3_bind_text(stmt, 1, slug, -1, SQLITE_STATIC);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW)
    {
        int id = sqlite3_column_int(stmt, 0);
        const char *name = (const char *)sqlite3_column_text(stmt, 1);

        /* Build JSON response with Jansson */
        cJSON *user_json = cJSON_CreateObject();
        cJSON_AddNumberToObject(user_json, "id", id);
        cJSON_AddStringToObject(user_json, "name", name);

        char *json_string = cJSON_PrintUnformatted(user_json);
        json(200, json_string);

        cJSON_Delete(user_json); // free cJSON memory
        free(json_string);       // free json_string memory
    }
    else
    {
        text(404, "User not found");
    }

    /* Cleanup */
    sqlite3_finalize(stmt);
    cJSON_Delete(session_data);
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
