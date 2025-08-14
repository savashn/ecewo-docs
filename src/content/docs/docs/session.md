---
title: Session-Based Authentication
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We can easily manage the authentication and authorization using [ecewo-session](https://github.com/savashn/ecewo-session) library. In this page, we'll do authentication examples using it, but for more detailed API referance, refer to its [documentation](https://github.com/savashn/ecewo-session/blob/main/README.md).

Let's make an authentication example and see how it works.

## Installation

### Using [Ecewo-CLI](https://github.com/savashn/ecewo-cli)

```
ecewo install session
```

### Manually

Copy the [session.c](https://github.com/savashn/ecewo-session/blob/main/session.c) and [session.h](https://github.com/savashn/ecewo-session/blob/main/session.h) files from the  repository, and then paste them into `vendors/` folder. Make sure `session.c` is part of the CMake build configuration.

## Usage

### Login

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
      set_session(session, "id", STATIC_USER_ID);
      set_session(session, "theme", "dark");

      /*
      Send the session as cookie for 1 hour
      max_age is not required because
      it will be the integer that
      we pass to create_session
      */
      cookie_options_t cookie_options = {
          .path = "/",
          .same_site = "Lax",
          .http_only = true,
          .secure = true,
      };

      send_session(res, session, &cookie_options);

      printf("Session ID: %s\n", session);
      send_text(res, 200, "Login successful!");
   }
   else
   {
      send_text(res, 401, "Invalid username or password");
   }

   cJSON_Delete(json);
   // Free the created session too if you will save it in a database:
   // free_session(session);
}

void destroy_app(void) {
    reset_router();
    reset_sessions();
}

int main(void)
{
    init_router();
    init_sessions();

    post("/login", handle_login);

    shutdown_hook(destroy_app);
    ecewo(3000);
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

If login is successful, we'll see a **"Login successful!"** response and a header like `"Cookie": "session=VKdbMRbqMhh_40F6ef2FreEba6JqkH16"` will be added to the headers.

### Logout

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
    Session *session = get_session(req);

    if (!session)
    {
        send_text(res, 400, "You have to login first");
    }
    else
    {
        // The cookie_options should be the same
        // as what we use in the login handler
        cookie_options_t cookie_options = {
            .path = "/",
            .same_site = "Lax",
            .http_only = true,
            .secure = true,
        };

        destroy_session(res, session, &cookie_options);
        send_text(res, 302, "Logged out");
    }
}

void destroy_app(void) {
    reset_router();
    reset_sessions();
}

int main(void)
{
    init_router();
    init_sessions();

    post("/login", handle_login);
    get("/logout", handle_logout); // We also added it

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

`destroy_session()` is destroying the session from the memory and deleting the cookie from the client.

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
> `get_session()` is running `get_cookie()` under the hood, but it's specialized to extract the `session` from the `Cookie` header. While you need to manually free the memory returned by `get_cookie()`, you don't need to do that with `get_session()` — it handles memory management internally.

### Getting Session Data

We added 3 data to the session in the `Login` handler: `name`, `username` and `theme`. Let's write another function that sends the session data:

```c
// main.c

// ...
// [handle_login and handle_logout is here]
// ...

void handle_session_data(Req *req, Res *res)
{
   Session *session = get_session(req);

   if (!session)
   {
      send_text(res, 401, "Error: Authentication required");
      return;
   }

   char *name = get_session_value(session, "name");
   if (name)
   {
      printf("Name: %s\n", name);
      free(name); // Free the memory!
   }

   char *username = get_session_value(session, "username");
   if (username)
   {
      printf("Username: %s\n", username);
      free(username); // Free the memory!
   }

   char *id = get_session_value(session, "id");
   if (id)
   {
      printf("ID: %s\n", id);
      free(id); // Free the memory!
   }

   char *theme = get_session_value(session, "theme");
   if (theme)
   {
      printf("Theme: %s\n", theme);
      free(theme); // Free the memory!
   }

   send_text(res, OK, "Check out the console!");
}


void destroy_app(void) {
    reset_router();
    reset_sessions();
}

int main(void)
{
    init_router();
    init_sessions();

    get("/session", handle_session_data); // We added it now
    post("/login", handle_login);
    post("/logout", handle_logout);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

First, we need to login. Rebuild the program and send a `POST` request to the `http://localhost:3000/login` and get the session.
After that, send another request to the `http://localhost:3000/session` address to see the session data.

We'll get a `Check out the console!` response, and the output in the console will this:

```
Name: John Doe
Username: johndoe
ID: 1
Theme: dark
```

Here are the session data, which we have added while the user is logging in.

### Protected Routes

Let's say that we want some pages to be available for authenticated users only. In this situation, we can use `get_session()` and `get_session_valuıe()` functions to check if the user has a session.

```c
// main.c

// <-- Here are the other handlers -->

void handle_protected_route(Req *req, Res *res)
{
   // Get session from request
   Session *sess = get_session(req);
   if (!sess)
   {
      // No session, user not logged in
      send_text(res, UNAUTHORIZED, "Error: Authentication required");
      return;
   }

   // Get user information
   char *user_id = get_session_value(sess, "id");

   if (user_id && strcmp(user_id, STATIC_USER_ID) == 0)
   {
      size_t msg_len = strlen("Welcome, ") + strlen(STATIC_NAME) + 1;

      char *welcome_message = malloc(msg_len);
      if (!welcome_message)
      {
         perror("malloc");
         free(user_id);
         return;
      }

      snprintf(welcome_message, msg_len, "Welcome, %s", STATIC_NAME);
      send_text(res, OK, welcome_message);
      free(welcome_message);
   }
   else
   {
      send_text(res, FORBIDDEN, "You are not allowed to see this page.");
   }

   free(user_id);
}

void destroy_app(void) {
    reset_router();
    reset_sessions();
}

int main(void)
{
    init_router();
    init_sessions();

    get("/protected", handle_protected); // We added it now
    get("/session", handle_session_data);
    post("/login", handle_login);
    post("/logout", handle_logout);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's send a request to `http://localhost:3000/protected`. If we authenticated as John Doe, we'll see:

```
Welcome to the protected area, John Doe
```

If we are logged in, but not as John Doe, we'll see:

```
You must be logged in.
```

If we did not log in at all, we'll see:

```
Error: Authentication required
```

### Notes

> **NOTE 1**
>
> It's not safe to insert the password to the database without encryption. You should use a library to encrypt the user password before inserting.

> **NOTE 2**
>
> In these examples, session is stored in memory, but you can store them in the database if you prefer.
>
> If you store them in the memory, you will use `free_session()` function for rare operations like logout. Ecewo will free the expired sessions when a new session is created.
>
> But if you prefer storing the sessions in a database, you may free the session from memory right after you create and insert it into the database.
