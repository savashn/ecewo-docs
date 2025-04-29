---
title: Installation
description: Documentation of ecewo - A minimal HTTP framework for C.
---

## Requirements

GCC is required to compile and run the program, that's all. Please note that ecewo is running on Windows only for now. Support for Linux and macOS is planned to be added in the future.

## Install

Since ecewo doesn't use any package manager, you need to clone this repo to use it. Follow these steps to clone:

```
git clone https://github.com/savashn/ecewo.git
cd ecewo
```

## Update

To update ecewo, simply copy the entire `ecewo` folder and replace your existing one.
Make sure that the system files starting with `ecewo/` listed in the SRC section of your `makefile` haven’t changed.
If they have, copy the SRC list from the new version’s `makefile` and paste it into your existing one.

## Makefile

The `makefile` is one of the most important file of your program. You must make the configuration of your `makefile` correct, otherwise you will get errors while trying to compile your program.

### CFLAGS

`CFLAGS` are the directory flags of your program. If you create a folder, you need to add its path into it to use header files in the folder you created.

```
CFLAGS = -I./ -I./ecewo -I./ecewo/lib -I./src
```

### LDFLAGS

`LDFLAGS` are the linking flags of your libraries. If your OS is Windows, you need to add `-lws2_32` flag.

```
LDFLAGS = -lws2_32
```

### SRC

There is an important config named `SRC` for your server in it and you need to deal with it while you're developing your server.

```
SRC = \
ecewo/server.c \
ecewo/router.c \
ecewo/routes.c \
ecewo/request.c \
ecewo/lib/session.c \
ecewo/lib/cjson.c \
```

There are root files in the `ecewo` directory. So to touch them would be dangerous.

When you creating a new `.c` file, you must add the filename into `SRC`. For example; if you create a new `handler.c` file in the `src` directory, you must add its path to the `SRC` list to compile that file.

### Shortcuts

There are some shortcuts at the bottom of the `makefile`:

```
make		// compile the program
make run	// run the program
make clean	// destroy the program
make build	// destroy, compile and then run the program

```
