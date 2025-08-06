---
title: Using A Database
description: Documentation of Ecewo — A minimalist and easy-to-use web framework for C
---

We need a database if we are building a backend service. This documentation shows how to use SQLite.

## Installation

### Using [Ecewo-CLI](https://github.com/savashn/ecewo-cli)

```
ecewo install sqlite
```

### Manually

Install [SQLite3](https://www.sqlite.org/download.html), then add the `sqlite3.c` and `sqlite3.h` files into `vendors/` folder. Make sure `sqlite3.c` is part of the CMake build configuration.

### Example Folder Structure

```
your-project/
├── CMakeLists.txt          # CMake of our project
├── vendors/                # Our external libraries
│   ├── sqlite3.c           # SQLite3 source file we installed
│   └── sqlite3.h           # SQLite3 header file we installed
└── src/                    # Source code of ours
    ├── handlers/           # Folder for our handlers
    │   ├── handlers.c      # Our handlers
    │   └── handlers.h      # Header file of handlers
    ├── db/                 # Folder for our database migrations
    │   ├── db.h            # Our database header file
    │   └── db.c            # Our database configs
    └── main.c              # Main application entry point
```

## Connecting To Database

```c
// src/db/db.c

#include <stdio.h>
#include "sqlite3.h"

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

```c
// src/db/db.h

#ifndef DB_H
#define DB_H

#include "sqlite3.h"

extern sqlite3 *db;

int init_db();

#endif
```

```c
// src/main.c

#include "server.h"
#include "db/db.h"

void destroy_app() {
    sqlite3_close(db);
}

int main()
{
    init_db();
    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Now we can rebuild our program. If everything went OK, a `db.sql` file containing a `users` table will be created in your root directory.

## Example Usage

### Inserting Data

We already created a 'Users' table in the previously chapter. Now we will add a user to it. Let's begin with writing our POST handler:

```c
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void add_user(Req *req, Res *res);

#endif
```

```c
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "sqlite3.h"

extern sqlite3 *db; // THIS IS IMPORTANT TO USE THE DATABASE

// Function to add a user to the database
void add_user(Req *req, Res *res)
{
    const char *body = req->body; // Get the body of the request

    // If there is no body, return a 400 Bad Request response
    if (body == NULL)
    {
        send_text(res, 400, "Missing request body");
        return;
    }

    // Parse the body as JSON
    cJSON *json = cJSON_Parse(body);

    // If JSON parsing fails, return a 400 Bad Request response
    if (!json)
    {
        send_text(res, 400, "Invalid JSON");
        return;
    }

    // Extract the 'name', 'surname', and 'username' fields from the JSON object
    const char *name = cJSON_GetObjectItem(json, "name")->valuestring;
    const char *username = cJSON_GetObjectItem(json, "username")->valuestring;
    const char *password = cJSON_GetObjectItem(json, "password")->valuestring;

    // If any of the required fields are missing, delete the JSON object and return a 400 error
    if (!name || !username || !password)

    {
        cJSON_Delete(json);
        send_text(res, 400, "Missing fields");
        return;
    }

    // SQL query to insert a new user into the database
    const char *sql = "INSERT INTO users (name, username, password) VALUES (?, ?, ?);";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    // If the SQL preparation fails, return a 500 Internal Server Error
    if (rc != SQLITE_OK)
    {
        cJSON_Delete(json);
        send_text(res, 500, "DB prepare failed");
        return;
    }

    // Bind the values to the SQL query
    sqlite3_bind_text(stmt, 1, name, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, username, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, password, -1, SQLITE_STATIC);

    // Execute the SQL statement to insert the user
    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    cJSON_Delete(json);

    // If the insert operation fails, return a 500 error
    if (rc != SQLITE_DONE)
    {
        send_text(res, 500, "DB insert failed");
        return;
    }

    // If everything is successful, return a 201 Created response
    send_text(res, 201, "User created!");
}
```

```c
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "db/db.h"

void destroy_app() {
    reset_router();
    sqlite3_close(db);
}

int main()
{
    init_router();
    init_db();

    post("/user", add_user);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Let's rebuild our server and then send a `POST` request at `http://localhost:3000/user`.
We can use `POSTMAN` or something else to send requests.

We'll send a request, which has a body like:

```json
{
    "name": "John Doe",
    "username": "johndoe",
    "password": "123123",
}
```

If everything is correct, the output will be `User created!`.

Let's send one more request for the next example:

```json
{
    "name": "Jane Doe",
    "username": "janedoe",
    "password": "321321",
}
```

### Querying Data

Now we'll write a handler function that gives us these two users' information.
But let's say that "name" and "surname" fields are not required for us, so we need "id" and "username" fields only.
To do this:

```c
// src/handlers/handlers.h

#ifndef HANDLERS_H
#define HANDLERS_H

#include "ecewo.h"

void get_all_users(Req *req, Res *res);

#endif
```

```c
// src/handlers/handlers.c

#include "handlers.h"
#include "cJSON.h"
#include "sqlite3.h"

void get_all_users(Req *req, Res *res)
{
    const char *sql = "SELECT * FROM users;";

    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    if (rc != SQLITE_OK)
    {
        send_text(res, 500, "DB prepare failed");
        return;
    }

    cJSON *json_array = cJSON_CreateArray();

    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW)
    {
        const int id = sqlite3_column_int(stmt, 0);                        // 0 is the index of the 'id' column
        const char *name = sqlite3_column_text(stmt, 1);                   // 1 is the index of the 'name' column
        const char *username = (const char *)sqlite3_column_text(stmt, 2); // 2 is the index of the 'username' column

        cJSON *user_json = cJSON_CreateObject();
        cJSON_AddNumberToObject(user_json, "id", id);
        cJSON_AddStringToObject(user_json, "name", name);
        cJSON_AddStringToObject(user_json, "username", username);

        cJSON_AddItemToArray(json_array, user_json);
    }

    if (rc != SQLITE_DONE)
    {
        send_text(res, 500, "DB step failed");
        sqlite3_finalize(stmt);
        cJSON_Delete(json_array);
        return;
    }

    char *json_string = cJSON_PrintUnformatted(json_array);

    send_json(res, 200, json_string); // Send the json response

    // Free the allocated memory when we are done:
    cJSON_Delete(json_array);
    free(json_string);
    sqlite3_finalize(stmt);
}
```

**Why didn't we use `for` instead of `while`?**

We could have used a `for` loop too, but it would be more complicated and less readable.

If we had written it with a `for` loop, it would look like this:

```c
for (rc = sqlite3_step(stmt); rc == SQLITE_ROW; rc = sqlite3_step(stmt))
{
    // ...
}
```

... instead of this:

```c
while ((rc = sqlite3_step(stmt)) == SQLITE_ROW)
{
    // ...
}
```

You can use `for` loop if you want, but `while` loop is more readable for this job as you can see.

```c
// src/main.c

#include "server.h"
#include "handlers/handlers.h"
#include "db/db.h"

void destroy_app() {
    reset_router();
    sqlite3_close(db);
}

int main()
{
    init_router();
    init_db();

    post("/user", add_user);
    get("/users", get_all_users);

    shutdown_hook(destroy_app);
    ecewo(3000);
    return 0;
}
```

Now if we send a request, we'll receive this output:

```json
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
