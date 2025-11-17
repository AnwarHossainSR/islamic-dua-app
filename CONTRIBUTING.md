# Contributing Guidelines

## Commit Message Format

Use conventional commit format:

```
type(scope): description

feat(auth): add biometric login support
fix(ui): resolve button alignment issue
docs(readme): update installation steps
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

## Pre-commit Checks

Before each commit, the following checks run automatically:
- TypeScript type checking
- ESLint code linting
- Commit message format validation

## Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes and commit: `git commit -m "feat(scope): description"`
3. Push and create PR: `git push origin feat/feature-name`

## Code Standards

- Use TypeScript for all new code
- Follow ESLint rules
- Write meaningful commit messages
- Keep functions small and focused
- Add proper error handling