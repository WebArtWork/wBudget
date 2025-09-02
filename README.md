# Angular 19

## Overview

An Angular project with custom modifications to enhance structure, maintainability, and code consistency.

## Installation & Setup

To get started with project, follow these steps:

```sh
npm install
npm start
```

The project includes two environment configurations:

- `environment.ts` (for local development)
- `environment.prod.ts` (for production builds)

## Project Folder Structure

```
/src
  /app
    /core          # Shared code between pages
    /modules       # Shared code between projects
    /pages         # Role-based pages (guest, user)
  /assets          # Static assets
  /environments    # Configuration files
```

## Component Structure

All Angular components class should follow this structure:

1. **Readonly variables**
2. **Public variables**
3. **Constructor**
4. **Public functions**
5. **Private variables**
6. **Private functions**

### Naming Conventions

- Private variables and functions should start with an underscore (`_`).
- Services should be injected in the constructor like this:
    ```typescript
    public configService: ConfigService
    private _configService: ConfigService
    ```

## Module & Page Structure

- Each page has its own module for **lazy loading**.
- All components required by a page should be built in that module **without standalone components**.
- Preferably, use `ngFor` with a **component** and `trackBy` function.
- The `modules` folder should include well-documented code containing:
    - **Interfaces**
    - **Services**
    - **Pages**
    - **Components**
    - **Selectors**
- The `core` folder contains shared code loaded across all pages.
- The `pages` folder contains role-based pages:
    - **Guest** (default role)
    - **User**

## CLI Commands

Critical `waw` commands for generating project structures:

- `waw add MODULENAME` - Creates a new module with:
    - Interface
    - Service
    - Page
    - Selector
    - Form component
    - Config
- `waw page ROLE PAGENAME` - Creates a page under a specific role.
- `waw service SERVICENAME` - Creates a service in the `core` folder.

For the full list of `waw` CLI commands, visit the **[waw Angular CLI repository](https://github.com/WebArtWork/waw-angular)**.

## Best Practices

- **Do not use any interface decorators.**
- **Avoid writing code twice (follow DRY principles).**

## Example Usage of `waw` CLI

To create a new module:

```sh
waw add user
```

This generates a `user` module with all necessary components.

To create a new page for a user role:

```sh
waw page user dashboard
```

To create a new service:

```sh
waw service user
```

## Testing Guidelines

The project uses **Jest** for unit testing.

To run tests:

```sh
npm run test
```

For live testing while developing:

```sh
npm run test:watch
```

## Contribution Guide

This project was forked from the **[ngx-platform repository](https://github.com/WebArtWork/ngx-platform)**. If you want to improve the code base, please submit a pull request to the base repository.

If you wish to contribute to this specific instance, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature.
3. Follow the coding guidelines outlined in this document.
4. Submit a pull request for review.
