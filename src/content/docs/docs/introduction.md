---
title: Introduction
description: Documentation of ecewo - A minimal HTTP framework for C.
---

ecewo is a minimal HTTP framework for C. It takes the hard part of C programming for you and lets you build your backend easily.

## Table of Contents

1. [Getting Started](/docs/getting-started)
    - 1.1 [Requirements](/docs/getting-started#requirements)
    - 1.2 [Installation](/docs/getting-started#installation)
    - 1.3 [Start Server](/docs/getting-started#start-server)
        - 1.3.1 [Write The Entry Point](/docs/getting-started#write-the-entry-point)
        - 1.3.2 [Build And Run The Server](/docs/getting-started#build-and-run-the-server)
2. [Route Handling](/docs/route-handling)
    - 2.1 [Handlers](/docs/route-handling#handlers)
    - 2.2 [Declaring Routes](/docs/route-handling#declaring-routes)
    - 2.3 [Notes](/docs/route-handling#notes)
3. [Handling Requests](/docs/handling-requests)
    - 3.1 [Request Body](/docs/handling-requests#request-body)
    - 3.2 [Request Params](/docs/handling-requests#request-params)
    - 3.3 [Request Query](/docs/handling-requests#request-query)
    - 3.4 [Request Headers](/docs/handling-requests#request-headers)
4. [Using JSON](/docs/using-json)
    - 4.1 [Creating JSON](/docs/using-json#creating-json)
    - 4.2 [Parsing JSON](/docs/using-json#parsing-json)
5. [Using A Database](/docs/using-a-database)
    - 5.1 [Install SQLite](/docs/using-a-database#install-sqlite)
    - 5.2 [Example Folder Structure](/docs/using-a-database#example-folder-structure)
    - 5.3 [Change The Makefile](/docs/using-a-database#change-the-makefile)
    - 5.4 [Connecting To Database](/docs/using-a-database#connecting-to-database)
    - 5.5 [Example Usage](/docs/using-a-database#example-usage)
        - 5.5.1 [Inserting Data](/docs/using-a-database#inserting-data)
        - 5.5.2 [Querying Data](/docs/using-a-database#querying-data)
6. [Authentication](/docs/authentication)
    - 6.1 [Login](/docs/authentication#login)
    - 6.2 [Logout](/docs/authentication#logout)
    - 6.3 [Getting session data](/docs/authentication#getting-session-data)
    - 6.4 [Protected Routes](/docs/authentication#protected-routes)
    - 6.5 [Notes](/docs/authentication#notes)
7. [Middleware](/docs/middleware)
    - 7.1 [Route Middleware](/docs/middleware#route-middleware)
    - 7.2 [Global Middleware](/docs/middleware#global-middleware)
8. [Environment Variables](/docs/environment-variables)
