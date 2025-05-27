# Pillars CLI

A powerful Node.js project scaffolder CLI tool that helps you create and manage Node.js projects with ease.

## Features

- Create new Node.js projects with a single command
- Support for both JavaScript and TypeScript projects
- Add new components (controllers, services, models) to your project
- Automatic package manager detection and selection
- Built-in test setup with Jest
- Simple and intuitive command-line interface

## Installation

```bash
npm install -g pillars
```

## Usage

### Create a New Project

Create a new Node.js project with the following command:

```bash
pillars create <project-name>
```

Options:
- `--typescript`: Create a TypeScript project instead of JavaScript

When creating a project, you'll be prompted to select your preferred package manager:
```
📦 Select a package manager:
1. npm (default)
2. yarn
3. pnpm
```

Example:
```bash
# Create a JavaScript project
pillars create my-project

# Create a TypeScript project
pillars create my-ts-project --typescript
```

The created project will include:
- Express.js server setup
- Environment configuration
- Basic project structure
- Development and production scripts
- TypeScript configuration (if selected)

### Add Components

Add new components to your project using the `add` command:

```bash
pillars add <type> <name>
```

Where:
- `<type>`: The type of component (e.g., controller, service, model)
- `<name>`: The name of the component

Available Component Types:
- `controller`: Creates a new controller with basic CRUD operations
- `service`: Creates a new service with business logic structure
- `model`: Creates a new data model with schema definition
- `middleware`: Creates a new middleware function
- `route`: Creates a new route configuration
- `util`: Creates a new utility function
- `config`: Creates a new configuration file
- `test`: Creates a new test file with Jest setup

Examples:
```bash
# Add a new controller
pillars add controller user
pillars add controller auth
pillars add controller product

# Add a new service
pillars add service user
pillars add service auth
pillars add service email

# Add a new model
pillars add model user
pillars add model product
pillars add model order

# Add a new middleware
pillars add middleware auth
pillars add middleware logger
pillars add middleware cors

# Add a new route
pillars add route api
pillars add route admin
pillars add route public

# Add a new utility
pillars add util helpers
pillars add util validators
pillars add util constants

# Add a new configuration
pillars add config database
pillars add config email
pillars add config app

# Add a new test
pillars add test user
pillars add test auth
pillars add test product
```

### Testing

When you add a test file using `pillars add test <name>`, it will:
1. Create a new test file in the `__tests__` directory
2. Set up Jest configuration
3. Install necessary dependencies
4. Configure TypeScript support (if using TypeScript)

Run your tests using:
```bash
# If using npm
npm test

# If using yarn
yarn test

# If using pnpm
pnpm test
```

## Getting Help

Get help for any command using the `--help` flag:

```bash
# General help
pillars --help

# Help for create command
pillars create --help

# Help for add command
pillars add --help
```

## Project Structure

A typical project created with Pillars CLI will have the following structure:

```
my-project/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── index.js (or index.ts)
├── __tests__/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json (if TypeScript)
```

## Version

Current version: 1.0.0

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 