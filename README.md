# Void mod manager

A very, very, in development mod manager (Made specifically for penguins)

## Features

- Auto finding installed games
- Automatically downloads and installs mods from the built-in mod page
- Automatically set-up game for running mods (Coming soon)
- Access configs for mods without having to launch (Coming soon)
- Profiles (Coming soon)

## FAQ

#### Why is the code so messy?

Honestly, I'm just bad at organisation, it will get better with time, this is my first project made in Rust.

#### I want a new game to be supported, how can I do that?

You can either make the implimentation yourself, and then make a pr or make a feature issue and we'll work on it!

#### Where can I download this?

Until it reaches a stable version (where it's actually usable) I will not be providing any downloads

#### Is this project Linux only?

No, this project will run on Linux and Windows, it's just mostly made for Linux users.

## Run Locally

Clone the project

```bash
  git clone https://github.com/NotGhoull/void-mod-manager
```

Go to the project directory

```bash
  cd void-mod-manager
```

Install dependencies (Make sure you have rust installed)

```bash
  bun i
```

Start the server

```bash
  bun run tauri dev
```
