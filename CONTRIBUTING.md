# Contributing to Void Mod Manager

First off, thank you for taking the time to contribute to the project! Contributions of any kind are welcome here, from reporting issues and fixing bugs to writing documentation or new features!

---

### Table of contents

1. [Getting started](#getting-started)
2. [Development setup](#development-setup)
3. [Code style guidelines](#code-style-guidelines)
4. [How to submit a bug report](#how-to-submit-a-bug-report)
5. [How to suggest a feature](#how-to-suggest-a-feature)
6. [Pull requests](#pull-requests)
7. [Testing](#testing)

---

# Getting started

To start contributing, you'll need to clone the repository and install the necessary dependencies.

## Steps

1. **Clone the Repo**

   ```bash
   git clone https://github.com/NotGhoull/void-mod-manager.git
   ```

2. **Install Dependencies**\
   Make sure you have [Bun](https://bun.sh) and [Cargo](https://www.rust-lang.org/tools/install) installed; To install the dependencies

   ```bash
   bun install
   ```

3. **Start the development server**\
   Run the following command to start the project locally:

   ```bash
   bun run tauri dev
   ```

4. **Building**\
   This will be done automatically, on push, but if you want to build locally you can do it like this:

   ```bash
   bun run tauri build
   ```

---

# Development setup

Make sure you have both Rust and Bun installed. The front end is built using React, and the backend uses Rust with Tauri.

- **Backend:** Rust (via Cargo)
- **Frontend:** React (via Bun)

Ensure that code compiles properly before submitting pull requests.

---

# Code Style Guidelines

At the moment, there are no strict code style requirements, but I encourage a clean and readable code style, not that I always follow it myself. I'll add more concrete style guides in the future.

---

# How to submit a bug report

If you've found a bug please report it by [opening an issue](https://github.com/NotGhoull/void-mod-manager/issues/new) in the repo. Be sure to include as much detail as possible.

## Example template

- **Summary**: Provide a concise description of the issue.
- **Steps to reproduce**: List the steps needed to reproduce the bug.
- **Expected behaviour**: Describe what should happen.
- **Actual behaviour**: Describe what actually happens.
- **Screenshots or logs**: Attach any logs or screenshots that are relevant.

---

# How to suggest a feature

I'm always open to new ideas! If you have any feature request, please [open an issue](https://github.com/NotGhoull/void-mod-manager/issues/new) and tag it with the `feature` label.

When proposing new features, please be consider the scope of the project and describe your feature in as much detail as possible.

## Example template

- **Problem statment**: Describe the problem your feature would solve.
- **Proposed solution**: Provide details on how your feature would work.
- **Alternatives**: List any alternative solutions you've considered.

---

# Pull requests

When you're ready to submit a pull request (PR), make sure to follow these guidelines:

1. **Ensure the code works:** Before submitting a PR, make sure the project runs without errors.
2. **Lnk to Issues:** If your pull request addresses an open issue, make sure to link it in your PR description.
3. **Testing:** Currently, I don't have any tests, but please make sure to manually test your changes thoroughly. I'll add testing soon.
4. **Assign Reviewers:** Tag `@NotGhoull` as the reviewer for any pull request you open.

---

# Testing

We currently do not have any testing guidelines. However, if you want to write tests, please go for it, for new or old code, it's all appreciated!
