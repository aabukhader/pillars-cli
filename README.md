# Pillars CLI

[![npm version](https://badge.fury.io/js/pillars-cli.svg)](https://badge.fury.io/js/pillars-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/aabukhader/pillars-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/aabukhader/pillars-cli/actions/workflows/node.js.yml)

A powerful Node.js project scaffolder CLI tool that helps you create and manage Node.js projects with ease.

## Features

- Create new Node.js projects with a single command
- Support for both JavaScript and TypeScript projects
- Add new components (controllers, services, models) to your project
- Automatic package manager detection and selection
- Built-in test setup with Jest
- Simple and intuitive command-line interface
- Express.js integration out of the box
- Environment configuration management
- TypeScript support with proper configuration

## Prerequisites

- Node.js >= 14.0.0
- npm, yarn, or pnpm

## Installation

```bash
npm install -g pillars-cli
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
- `resource` or `rs`: Creates a complete resource with model, repository, service, controller, and routes
- `model` or `md`: Creates a new data model with schema definition
- `repository` or `rp`: Creates a new repository for data access
- `service` or `sv`: Creates a new service with business logic structure
- `controller` or `ct`: Creates a new controller with basic CRUD operations
- `route` or `r`: Creates a new route configuration
- `test`: Creates a new test file with Jest setup

Examples:
```bash
# Add a complete resource
pillars add resource user
pillars add rs product

# Add a new model
pillars add model user
pillars add md product

# Add a new repository
pillars add repository user
pillars add rp product

# Add a new service
pillars add service user
pillars add sv product

# Add a new controller
pillars add controller user
pillars add ct product

# Add a new route
pillars add route api
pillars add r admin

# Add a new test
pillars add test user
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

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

To set up the development environment:

```bash
# Clone the repository
git clone https://github.com/aabukhader/pillars-cli.git

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this project helpful, please give it a ⭐️ on [GitHub](https://github.com/aabukhader/pillars-cli)!

For support, please:
- Open an issue on GitHub
- Check the [documentation](https://github.com/aabukhader/pillars-cli#readme)
- Join our [Discord community](https://discord.gg/your-discord-link) (if available) 