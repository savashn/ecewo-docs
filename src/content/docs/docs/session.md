---
title: Session-Based Authentication
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

Ecewo offers session management feature for authentication and authorization. First, we need to install the `session.c` and `session.h` files from [ecewo-session repository](https://github.com/savashn/ecewo-session) and add them to our project.

- `init_sessions()` to initialize the session system
- `reset_sessions()` to clean up and free all session resources
- `create_session()` to create a session
- `find_session()` to find a session in memory
- `get_session()` to get the session from request
- `free_session()` to delete the session only from memory
- `send_session()` to send the session to the client as cookie
- `delete_sesion()` to delete the session both from the client and the memory
- `print_sessions()` to print all the active sessions

With the power of these functions, we can easily manage the authentication and authorization. Refer to the [README.md](https://github.com/savashn/ecewo-session/blob/main/README.md) file in the original repository for more detailed explanations.

Let's make an authentication example and see how it works.

## Login

Let's write a `login` handler:

```c
// main.c

#include "server.h"
#include "ecewo.h"
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
    send_text(res, 400, "Missing request body");
    return;
  }

  cJSON *json = cJSON_Parse(body);
  if (!json)
  {
    send_text(res, 400, "Invalid JSON");
    return;
  }

  const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
  const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

  if (!username || !password)
  {
    cJSON_Delete(json);
    send_text(res, 400, "Missing fields");
    return;
  }

  if (strcmp(username, STATIC_USERNAME) == 0 && strcmp(password, STATIC_PASSWORD) == 0)
  {
    // Create session on RAM for 1 hour
    Session *session = create_session(3600);

    // Set key-value variables to the session
    set_session(session, "name", STATIC_NAME);
    set_session(session, "username", STATIC_USERNAME);
    set_session(session, "theme", "dark");

    // Send the session as cookie for 1 hour
    send_session(res, session);

    printf("Session ID: %s\n", sid);
    printf("Session JSON: %s\n", sess->data);

    send_text(res, 200, "Login successful!");
  }
  else
  {
    send_text(res, 401, "Invalid username or password");
  }

  cJSON_Delete(json);
}

int main()
{
    init_router();
    init_sessions();

    post("/login", handle_login);

    ecewo(3000);

    reset_sessions();
    reset_router();

    return 0;
}
```

Let's send a request to `http://localhost:3000/login` with that body:

```json
{
    "username": "johndoe",
    "password": "123123"
}
```

If login is successful, we'll see a **"Login successful!"** response and a header like `"Cookie": "session_id=VKdbMRbqMhh_40F6ef2FreEba6JqkH16"` will be added to the headers.

## Logout

We also write a logout handler to use after login. Let's add these parts:

```c
// main.c

// ...
// [handle_login is here]
// ...

// Add this handler:

void handle_logout(Req *req, Res *res)
{
    // First, check if the user has session
    Session *session = get_session(&req->headers);

    if (!session)
    {
        send_text(res, 400, "You have to login first");
    }
    else
    {
        delete_session(res, session);
        send_text(res, 302, "Logged out");
    }
}

int main()
{
    init_router();
    init_sessions();

    post("/login", handle_login);
    get("/logout", handle_logout); // We also added it

    ecewo(3000);

    reset_sessions();
    reset_router();

    return 0;
}
```

Now let's send a request to `http://localhost:3000/logout` after login. `Cookie` header will be deleted and we'll see that response:

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

## Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```c
// main.c

// ...
// [handle_login and handle_logout is here]
// ...

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        send_text(res, 401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        send_text(res, 500, "Error: Failed to parse session data");
        return;
    }

    /* Serialize back to a compact JSON string */
    char *session_str = cJSON_PrintUnformatted(session_data);
    if (!session_str)
    {
        cJSON_Delete(session_data);
        send_text(res, 500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    send_json(res, 200, session_str);

    /* Clean up */
    free(session_str);
    cJSON_Delete(session_data);
}

int main()
{
    init_router();
    init_sessions();

    get("/session", handle_session_data); // We added it now
    post("/login", handle_login);
    post("/logout", handle_logout);

    ecewo(3000);

    reset_sessions();
    reset_router();
    
    return 0;
}
```

First, we need to login. Rebuild the program and send a `POST` request to the `http://localhost:3000/login` and get the session.
After that, send another request to the `http://localhost:3000/session` address to see the session data.
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
// main.c

void handle_session_data(Req *req, Res *res)
{
    Session *user_session = get_session(&req->headers);

    if (!user_session)
    {
        send_text(res, 401, "Error: Authentication required");
        return;
    }

    /* Parse the JSON string stored in session->data */
    cJSON *session_data = cJSON_Parse(user_session->data);
    if (!session_data)
    {
        /* If parsing fails, return an error */
        send_text(res, 500, "Error: Failed to parse session data");
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
        send_text(res, 500, "Error: Failed to serialize session data");
        return;
    }

    /* Send the session JSON back to the client */
    send_json(res, 200, json_str);

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

## Protected Routes

Let's say that we want some pages to be available for authenticated users only. In this situation, we can use `get_session()` function to check if the user has a session.

```c
// main.c

// <-- Here are the other handlers -->

void handle_protected(Req *req, Res *res)
{
    // Check if the user has session
    Session *sess = get_session(&req->headers);

    // If the user hasn't, return an error with 401 status code
    if (!sess)
    {
        send_text(res, 401, "You must be logged in.");
        return;
    }

    // If has, let the user in
    send_text(res, 200, "Welcome to the protected area!");
}

int main()
{
    init_router();
    init_sessions();

    get("/protected", handle_protected); // We added it now
    get("/session", handle_session_data);
    post("/login", handle_login);
    post("/logout", handle_logout);

    ecewo(3000);

    reset_sessions();
    reset_router();

    return 0;
}
```

Let's send a request to `http://localhost:3000/protected`. If we authenticated, we'll see:

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
// main.c

// <---------------------->
// <--- OTHER HANDLERS --->
// <---------------------->

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
    send_text(res, 401, "Authentication required");
    return;
  }

  cJSON *session_data = cJSON_Parse(sess->data);
  if (!session_data)
  {
    send_text(res, 500, "Invalid session data");
    return;
  }

  const cJSON *username = cJSON_GetObjectItem(session_data, "username");
  const char *slug = get_params("slug");

  if (!slug || strcmp(slug, username->valuestring) != 0)
  {
    cJSON_Delete(session_data);
    send_text(res, 403, "Unauthorized: Slug does not match session username");
    return;
  }

  if (strcmp(slug, STATIC_USERNAME) == 0)
  {
    cJSON *user_json = cJSON_CreateObject();
    cJSON_AddNumberToObject(user_json, "id", STATIC_USER_ID);
    cJSON_AddStringToObject(user_json, "name", STATIC_NAME);

    char *json_string = cJSON_PrintUnformatted(user_json);
    send_json(res, 200, json_string);

    cJSON_Delete(user_json);
    free(json_string);
  }
  else
  {
    send_text(res, 404, "User not found");
  }

  cJSON_Delete(session_data);
}

int main()
{
    init_router();
    init_sessions();

    get("/edit/:slug", edit_profile);  // We added it now
    get("/protected", handle_protected);
    get("/session", handle_session_data);
    post("/login", handle_login);
    post("/logout", handle_logout);

    ecewo(3000);

    reset_sessions();
    reset_router();

    return 0;
}
```

Let's send 3 different request to the `http://localhost:3000/edit/johndoe` route.

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

## Notes

> **NOTE 1**
>
>It's not safe to insert the password to the database without encryption. You should use a library to encrypt the user password before inserting.

> **NOTE 2**
>
>In these examples, session is stored in memory, but you can store them in the database if you prefer.
>
>If you store them in the memory, you will use `free_session()` and `delete_session()` API for rare operations like logout. Ecewo will free the expired sessions when a new session is created.
>
>But if you prefer storing the sessions in a database, you may free the session from memory right after you create and insert it into the database.
