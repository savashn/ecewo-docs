---
title: Authentication
description: Documentation of ecewo - A minimal HTTP framework for C.
---

ecewo offers some session management APIs for authentication and authorization:

- `set_cookie()` to set cookie
- `create_session()` to create a session
- `find_session()` to find a session in memory
- `get_session()` to get the session from request
- `free_session()` to delete the session from memory

With the power of these APIs and cJSON, we can easily manage the authentication and authorization.

Let's make an authentication example and see how it works.

### Login

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
// src/handlers.c

#include <stdio.h>
#include "ecewo/router.h"
#include <cjson.h>
#include <session.h>
#include "src/db.h"

extern sqlite3 *db;

void handle_login(Req *req, Res *res)
{
    const char *body = req->body;

    if (body == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing request body");
        return;
    }

    cJSON *json = cJSON_Parse(body);

    if (!json)
    {
        reply(res, "400 Bad Request", "text/plain", "Invalid JSON");
        return;
    }

    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
    const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

    if (!username || !password)
    {
        cJSON_Delete(json);
        reply(res, "400 Bad Request", "text/plain", "Missing fields");
        return;
    }

    const char *sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    if (rc != SQLITE_OK)
    {
        cJSON_Delete(json);
        reply(res, "500 Internal Server Error", "text/plain", "DB prepare failed");
        return;
    }

    sqlite3_bind_text(stmt, 1, username, -1, SQLITE_STATIC); // Bind username as 1st parameter
    sqlite3_bind_text(stmt, 2, password, -1, SQLITE_STATIC); // Bind password as 2nd parameter

    rc = sqlite3_step(stmt); // Execute the query

    if (rc == SQLITE_ROW)
    {
        // If a row is returned from the database, login is successful
        const char *db_name = (const char *)sqlite3_column_text(stmt, 1); // Get name from column 1

        // Successful login:

        char *sid = create_session();      // Create a session
        Session *sess = find_session(sid); // Find the created session

        set_session(sess, "name", db_name);      // Add user's name
        set_session(sess, "username", username); // Add user's username
        set_session(sess, "theme", "dark");      // Add theme option

        set_cookie(res, "session_id", sid, 3600); // Send 1-hour session as cookie

        printf("Session ID: %s\n", sid);
        printf("Session JSON: %s\n", sess->data);

        reply(res, "200 OK", "text/plain", "Login successful!");
    }
    else
    {
        // If no row is returned, credentials are incorrect
        reply(res, "401 Unauthorized", "text/plain", "Invalid username or password");
    }

    sqlite3_finalize(stmt); // Finalize the query
    cJSON_Delete(json);     // Free the JSON object
}
```

```sh
// src/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo/router.h"

void handle_login(Req *req, Res *res);

#endif
```

```sh
// src/main.c

#include "ecewo/routes.h"
#include "handlers.h"

post("/login", handle_login);
```

If login is successful, a header like `"Cookie": "session_id=VKdbMRbqMhh_40F6ef2FreEba6JqkH16"` will be added to the headers.

### Logout

```sh
// src/handlers.c

void handle_logout(Req *req, Res *res)
{
    // First, check if the user has session
    Session *sess = get_session(&req->headers);

    if (sess)
    {
        free_session(sess); // Delete session from the memory
    }

    // Clean the session
    set_cookie(res, "session_id", "", 0); // Time out cookie, the browser will delete it

    reply(res, "302 Found", "text/plain", "Logged out");
}
```

```sh
// src/handlers.h

void handle_logout(Req *req, Res *res);
```

```sh
// src/main.c

post("/logout", handle_logout);
```

### Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```sh
// src/handlers.c

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        reply(res, "401 Unauthorized", "application/json", "{\"error\":\"Authentication required\"}");
        return;
    }

    cJSON *session_data = cJSON_Parse(user_session->data);

    char *session_str = cJSON_PrintUnformatted(session_data);

    reply(res, "200 OK", "application/json", session_str);

    free(session_str);
    cJSON_Delete(session_data);
}
```

```sh
// src/main.c

get("/handle-session", handle_session_data);
```

First, we need to login. Run the `make build` command, send a `POST` request to the login page and get the session.
After that, send another request to the `http://localhost:3000/handle-session` address to see the session data.
The output will this:

```sh
{
    "name": "John",
    "username": "johndoe",
    "theme": "dark"
}
```

Here are the session data, which we have added while the user is logging in.

If you don't want the whole session data, but just one or two, you can do it as well:

```sh
// src/handlers.c

void handle_session_name_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        reply(res, "401 Unauthorized", "application/json", "{\"error\":\"Authentication required\"}");
        return;
    }

    cJSON *session_data = cJSON_Parse(user_session->data);

    if (!session_data)
    {
        reply(res, "500 Internal Server Error", "application/json", "{\"error\":\"Invalid session data\"}");
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

    reply(res, "200 OK", "application/json", json_str);

    free(json_str);
    cJSON_Delete(session_data);
    cJSON_Delete(response);
}
```

The output will be:

```sh
{
    "name": "John"
}
```

### Protected Routes

Let's say that we want some pages to be available for authenticated users only. In this situation, we can use `get_session()` function to check if the user has a session.

```sh
// src/handlers.c

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
// src/handlers.c

void edit_profile(Req *req, Res *res)
{
    // First, check the user's session
    Session *sess = get_session(&req->headers);

    // If there is no session or it's invalid, return a 401 error
    if (!sess)
    {
        reply(res, "401 Unauthorized", "application/json", "{\"error\":\"Authentication required\"}");
        return;
    }

    // Parse session data as JSON
    cJSON *session_data = cJSON_Parse(sess->data);

    if (!session_data)
    {
        reply(res, "500 Internal Server Error", "application/json", "{\"error\":\"Invalid session data\"}");
        return;
    }

    cJSON *username = cJSON_GetObjectItem(session_data, "username"); // Get the "username" data from session

    // Compare slug (from params) and session username
    const char *slug = get_req(&req->params, "slug");

    if (strcmp(slug, username->valuestring) != 0)
    {
        reply(res, "403 Forbidden", "application/json", "{\"error\":\"Unauthorized: Slug does not match session username\"}");
        cJSON_Delete(session_data);
        return;
    }

    // Now we know that slug and session username match, let's proceed with the query
    const char *sql = "SELECT id, name FROM users WHERE username = ?;"; // Our SQL query for matching username

    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    if (rc != SQLITE_OK)
    {
        const char *errmsg = sqlite3_errmsg(db);
        char error_msg[256];
        snprintf(error_msg, sizeof(error_msg), "{\"error\":\"DB error: %s\"}", errmsg);
        reply(res, "500 Internal Server Error", "application/json", error_msg);
        cJSON_Delete(session_data);
        return;
    }

    sqlite3_bind_text(stmt, 1, slug, -1, SQLITE_STATIC); // Binding slug to the query

    rc = sqlite3_step(stmt);

    if (rc == SQLITE_ROW)
    {
        const int id = sqlite3_column_int(stmt, 0);                    // 0 is the index of the 'id' column
        const char *name = (const char *)sqlite3_column_text(stmt, 1); // 1 is the index of the 'name' column

        cJSON *user_json = cJSON_CreateObject();
        cJSON_AddNumberToObject(user_json, "id", id);
        cJSON_AddStringToObject(user_json, "name", name);

        char *json_string = cJSON_PrintUnformatted(user_json);
        reply(res, "200 OK", "application/json", json_string);

        cJSON_Delete(user_json); // free cJSON memory
        free(json_string);       // free json_string memory
    }
    else
    {
        reply(res, "404 Not Found", "application/json", "{\"error\":\"User not found\"}");
    }

    sqlite3_finalize(stmt);     // free sql memory
    cJSON_Delete(session_data); // free session_data memory
    free_req(&req->params);     // free req memory
}
```

Let's send 3 different request to the `http://localhost:3000/edit/johndoe` route.

If we try without any authorization, we'll get that response:

```sh
{
    "error": "Authentication required"
}
```

If we try to reach that page as someone who is not johndoe, we'll receive:

```sh
{
    "error": "Unauthorized: Slug does not match session username"
}
```

When we signed in as johndoe and send a request again, here is what we will get:

```sh
{
    "id": 1,
    "name": "John"
}
```

### Notes

** **NOTE 1** **

It's not safe to insert the password to the database without encryption. You should use a library to encrypt the user password before inserting.

** **NOTE 2** **

In these examples, session is stored in memory, but you can store them in the database if you prefer.

If you store them in the memory, you will use `free_session()` API for rare operations like logout. ecewo will free the expired sessions when a new session is created.

But if you prefer storing the sessions in a database, you may free the session from memory right after you create and insert it into the database.
