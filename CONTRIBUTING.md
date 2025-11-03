# Contributing to Open360

Thank you for your interest in contributing to Open360! 🎉

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/satriyobud/Open360/issues)
2. Use the bug report template when creating a new issue
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, MySQL version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues for similar suggestions
2. Use the feature request template
3. Describe:
   - The feature and its use case
   - How it would benefit users
   - Implementation ideas (optional)

### Code Contributions

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Open360.git
   cd Open360
   ```

2. **Create a feature branch** (see [Branch Naming](#branch-naming))
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow [Coding Standards](#coding-standards)
   - Add comments for complex logic
   - Update documentation if needed
   - Write tests if applicable

4. **Test your changes**
   ```bash
   # Test backend
   cd backend && npm run dev
   
   # Test frontend (in another terminal)
   cd frontend && npm start
   ```

5. **Commit your changes** (see [Commit Messages](#commit-messages))
   ```bash
   git add .
   git commit -m "Add: Description of your feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Include screenshots if UI changes

## Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Open360.git
   cd Open360
   npm run install-all
   ```

2. **Set up environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

3. **Create database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE 360_feedback;"
   ```

4. **Seed database**
   ```bash
   cd backend && node scripts/seed.js
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

See [Installation Guide](https://github.com/satriyobud/Open360/wiki/Installation-Guide) for detailed instructions.

## Coding Standards

### TypeScript
- Use TypeScript strict mode
- Add type annotations (avoid `any`)
- Use meaningful variable and function names
- Follow existing code style

### React/TypeScript
- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use Material-UI components consistently

### Backend/Express
- Use async/await for promises
- Handle errors properly with try-catch
- Validate all inputs using express-validator
- Use consistent error response format
- Add comments for complex business logic

### SQL/Database
- Use parameterized queries (prevent SQL injection)
- Add comments for complex queries
- Use transactions for multiple related operations

### File Structure
- Keep files focused on single responsibility
- Group related files in directories
- Use consistent naming conventions

## Branch Naming

Use the following prefixes for branch names:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-export-functionality`
- `fix/login-authentication-error`
- `docs/update-api-documentation`

## Commit Messages

Follow the conventional commits format:

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Remove:` - Remove feature
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Style:` - Code style changes (formatting)
- `Test:` - Adding or updating tests
- `Chore:` - Maintenance tasks

### Examples
```
Add: Department filter in employee management

Fix: Date display showing invalid date in employee table

Update: README with new installation steps

Docs: Add API endpoint examples
```

## Pull Request Process

1. **Before Submitting**
   - Ensure your branch is up to date with `main`
   - Run tests if available
   - Check for linting errors
   - Update documentation if needed

2. **PR Description**
   - Use the PR template
   - Describe what changes were made
   - Explain why the changes were made
   - Link related issues
   - Include screenshots for UI changes

3. **Review Process**
   - Maintainers will review your PR
   - Address feedback promptly
   - Be open to suggestions and improvements

4. **Merge**
   - PRs are merged after approval
   - Squash and merge is preferred
   - Your contribution will be credited

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/satriyobud/Open360/discussions)
- Create an issue with your question
- Check the [Wiki](https://github.com/satriyobud/Open360/wiki)

Thank you for contributing to Open360! 🌟

