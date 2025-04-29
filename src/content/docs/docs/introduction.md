---
title: Introduction
description: Documentation of ecewo - A minimal HTTP framework for C.
---

ecewo is a minimal HTTP framework for C. It takes the hard part of C programming for you and lets you build your backend easily.

## Table of Contents

1. [Installation](/docs/installation)
    - 1.1 [Requirements](/docs/installation#requirements)
    - 1.2 [Install](/docs/installation#install)
    - 1.3 [Update](/docs/installation#update)
    - 1.4 [Makefile](/docs/installation#makefile)
        - 1.4.1 [CFLAGS](/docs/installation#cflags)
        - 1.4.2 [LDFLAGS](/docs/installation#ldflags)
        - 1.4.3 [SRC](/docs/installation#src)
        - 1.4.4 [Shortcuts](/docs/installation#shortcuts)
2. [Start Server](/docs/start-server)
3. [Route Handling](/docs/route-handling)
    - 3.1 [Handlers](/docs/route-handling#handlers)
    - 3.2 [Declaring Routes](/docs/route-handling#declaring-routes)
    - 3.3 [Notes](/docs/route-handling#notes)
4. [Handling Requests](/docs/handling-requests)
    - 4.1 [Request Body](/docs/handling-requests#request-body)
    - 4.2 [Request Params](/docs/handling-requests#request-params)
    - 4.3 [Request Query](/docs/handling-requests#request-query)
    - 4.4 [Request Headers](/docs/handling-requests#request-headers)
5. [Using cJSON](/docs/using-cjson)
    - 5.1 [Creating JSON](/docs/using-json#creating-json)
    - 5.2 [Parsing JSON](/docs/using-json#parsing-json)
6. [Using A Database](/docs/using-a-database)
    - 6.1 [Install SQLite](/docs/using-a-database#install-sqlite)
    - 6.2 [Example Folder Structure](/docs/using-a-database#example-folder-structure)
    - 6.3 [Change The Makefile](/docs/using-a-database#change-the-makefile)
    - 6.4 [Connecting To Database](/docs/using-a-database#connecting-to-database)
    - 6.5 [Example Usage](/docs/using-a-database#example-usage)
        - 6.5.1 [Inserting Data](/docs/using-a-database#inserting-data)
        - 6.5.2 [Querying Data](/docs/using-a-database#querying-data)
7. [Authentication](/docs/authentication)
    - 7.1 [Login](/docs/authentication#login)
    - 7.2 [Logout](/docs/authentication#logout)
    - 7.3 [Getting session data](/docs/authentication#getting-session-data)
    - 7.4 [Protected Routes](/docs/authentication#protected-routes)
    - 7.5 [Notes](/docs/authentication#notes)
