---
title: Using A Database
description: Documentation of Ecewo — A modern microframework for web development in C
---

We need a database if we are building a backend service. This documentation shows how to use SQLite, but you can use any database you prefer.

## Install SQLite

Go to the official [SQLite](https://sqlite.org/download.html) page and download the `C source code as an amalgamation`, which is a zip file. We need only 2 files in it: `sqlite3.c` and `sqlite3.h`.

Unzip it, take the `sqlite3.c` and `sqlite3.h` files, and put them to anywhere you want in your `src` directory.

## Example Folder Structure

```
your-project/
├── ecewo/                  # Source codes of ecewo
└── src/                    # Source code of ours
    ├── main.c              # Main application entry point
    ├── handlers/           # Folder for our handlers
    │   ├── handlers.c      # Our handlers
    │   └── handlers.h      # Header file of handlers
    ├── lib/                # Folder for external libraries
    │   ├── sqlite3.c       # SQLite3 source code we downloaded
    │   └── sqlite3.h       # SQLite3 header file we downloaded
    ├── db/                 # Folder for our database migrations
    │   ├── db.h            # Our database header file
    │   └── db.c            # Our database configs
    └── CMakeLists.txt      # Our compiling configs
```

## Update CMake

Add `.c` files to `CMakeLists.txt` to compile:

```
// src/CMakeLists.txt

set(APP_SRC
    ${CMAKE_CURRENT_SOURCE_DIR}/main.c
    ${CMAKE_CURRENT_SOURCE_DIR}/handlers/handlers.c
    ${CMAKE_CURRENT_SOURCE_DIR}/lib/sqlite3.c
    ${CMAKE_CURRENT_SOURCE_DIR}/db/db.c
    PARENT_SCOPE
)
```

## Connecting To Database

```sh
// src/db/db.c

#include <stdio.h>
#include "src/lib/sqlite3.h"

sqlite3 *db = NULL;

// Create a user table
int create_table()
{
    const char *create_table =
        "CREATE TABLE IF NOT EXISTS users ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "name TEXT NOT NULL,"
        "username TEXT NOT NULL,"
        "password TEXT NOT NULL"
        ");";

    char *err_msg = NULL;

    int rc = sqlite3_exec(db, create_table, 0, 0, &err_msg);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "Cannot create the table: %s\n", err_msg);
        sqlite3_free(err_msg);
        return 1;
    }

    printf("Database and table are ready\n");
    return 0;
}

// Connection
int init_db()
{
    int rc = sqlite3_open("sql.db", &db);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "Cannot open the database: %s\n", sqlite3_errmsg(db));
        return 1;
    }

    // Call the table function to create
    create_table();

    printf("Database connection successful\n");
    return 0;
}
```

```sh
// src/db/db.h

#ifndef DB_H
#define DB_H

#include "src/lib/sqlite3.h"

extern sqlite3 *db;

int init_db();

#endif
```

```sh
// src/main.c

#include "ecewo.h"
#include "db/db.h"

int main()
{
    init_db();
    ecewo(4000);
    sqlite3_close(db);
    return 0;
}
```

Now we can rebuild our program. If everything went OK, a `db.sql` file containing a `users` table will be created in your root directory.

## Example Usage

### Inserting Data

We already created a 'Users' table in the previously chapter. Now we will add a user to it. Let's begin with writing our POST handler:

```sh
// src/handlers/handlers.c

#include "router.h"
#include "jansson.h"
#include "../lib/sqlite3.h"

extern sqlite3 *db; // THIS IS IMPORTANT TO USE THE DATABASE

// Function to add a user to the database
void add_user(Req *req, Res *res)
{
    const char *body = req->body; // Get the body of the request

    // If there is no body, return a 400 Bad Request response
    if (body == NULL)
    {
        reply(res, "400 Bad Request", "text/plain", "Missing request body");
        return;
    }

    // Parse the body as JSON
    json_error_t error;
    json_t *json = json_loads(body, 0, &error);

    // If JSON parsing fails, return a 400 Bad Request response
    if (!json)
    {
        reply(res, "400 Bad Request", "text/plain", "Invalid JSON");
        return;
    }

    // Extract the 'name', 'surname', and 'username' fields from the JSON object
    json_t *name_json = json_object_get(json, "name");
    json_t *username_json = json_object_get(json, "username");
    json_t *password_json = json_object_get(json, "password");

    // If any of the required fields are missing or not strings, clean up and return a 400 error
    if (!name_json || !username_json || !password_json ||
        !json_is_string(name_json) || !json_is_string(username_json) || !json_is_string(password_json))
    {
        json_decref(json);
        reply(res, "400 Bad Request", "text/plain", "Missing or invalid fields");
        return;
    }

    const char *name = json_string_value(name_json);
    const char *username = json_string_value(username_json);
    const char *password = json_string_value(password_json);

    // SQL query to insert a new user into the database
    const char *sql = "INSERT INTO users (name, username, password) VALUES (?, ?, ?);";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    // If the SQL preparation fails, return a 500 Internal Server Error
    if (rc != SQLITE_OK)
    {
        json_decref(json);
        reply(res, "500 Internal Server Error", "text/plain", "DB prepare failed");
        return;
    }

    // Bind the values to the SQL query
    sqlite3_bind_text(stmt, 1, name, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, username, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, password, -1, SQLITE_STATIC);

    // Execute the SQL statement to insert the user
    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    json_decref(json);

    // If the insert operation fails, return a 500 error
    if (rc != SQLITE_DONE)
    {
        reply(res, "500 Internal Server Error", "text/plain", "DB insert failed");
        return;
    }

    // If everything is successful, return a 201 Created response
    reply(res, "201 Created", "text/plain", "User created!");
}
```

Add to `handlers.h` too:

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void add_user(Req *req, Res *res);

#endif
```

In `main.c`:

```sh
// src/main.c

#include "ecewo.h"
#include "router.h"
#include "handlers/handlers.h"
#include "db/db.h"

int main()
{
    init_db();
    post("/user", add_user);
    ecewo(4000);
    sqlite3_close(db);
    return 0;
}
```

Let's rebuild our server and then send a `POST` request at `http://localhost:4000/user`.
We can use `POSTMAN` or something else to send requests.

We'll send a request, which has a body like:

```
{
    "name": "John Doe",
    "username": "johndoe",
    "password": "123123",
}
```

If everything is correct, the output will be `User created!`.

Let's send one more request for the next example:

```
{
    "name": "Jane Doe",
    "username": "janedoe",
    "password": "321321",
}
```

### Querying Data

Now we'll write a handler function that gives us these two users' information.
But let's say that "name" and "surname" fields are not required for us, so we need "id" and "username" fields only.
To do this, in `headers.c`:

```sh
// src/handlers/handlers.c

#include "router.h"
#include "jansson.h"
#include "../lib/sqlite3.h"

void get_all_users(Req *req, Res *res)
{
    const char *sql = "SELECT * FROM users;";

    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    if (rc != SQLITE_OK)
    {
        reply(res, "500 Internal Server Error", "text/plain", "DB prepare failed");
        return;
    }

    json_t *arr = json_array();

    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW)
    {
        const int id = sqlite3_column_int(stmt, 0);                        // 0 is the index of the 'id' column
        const char *name = sqlite3_column_text(stmt, 1);                   // 1 is the index of the 'name' column
        const char *username = (const char *)sqlite3_column_text(stmt, 2); // 2 is the index of the 'username' column

        json_t *user_json = json_object();
        json_object_set_new(user_json, "id", json_integer(id));
        json_object_set_new(user_json, "name", json_string(name));
        json_object_set_new(user_json, "username", json_string(username));

        json_array_append_new(arr, user_json);
    }

    if (rc != SQLITE_DONE)
    {
        reply(res, "500 Internal Server Error", "text/plain", "DB step failed");
        sqlite3_finalize(stmt);
        json_decref(arr);
        return;
    }

    char *json_string = json_dumps(arr, JSON_COMPACT);

    reply(res, "200 OK", "application/json", json_string); // Send the response

    // Free the allocated memory when we are done:
    json_decref(arr);
    free(json_string);
    sqlite3_finalize(stmt);
}
```

**Why didn't we use `for` instead of `while`?**

We could have used a `for` loop too, but it would be more complicated and less readable.

If we had written it with a `for` loop, it would look like this:
```sh
for (rc = sqlite3_step(stmt); rc == SQLITE_ROW; rc = sqlite3_step(stmt))
{
    // ...
}
```

... instead of this:
```sh
while ((rc = sqlite3_step(stmt)) == SQLITE_ROW)
{
    // ...
}
```

You can use `for` loop if you want, but `while` loop is more readable for this job as you can see.

Now let's define the header of our new handler and use it with the router in `main.c`:

```sh
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "router.h"

void get_all_users(Req *req, Res *res);

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
    post("/user", add_user);
    get("/users", get_all_users);
    ecewo(4000);
    sqlite3_close(db);
    return 0;
}
```

Now if we send a request, we'll receive this output:

```sh
[
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe"
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "username": "janedoe"
  }
]
```
