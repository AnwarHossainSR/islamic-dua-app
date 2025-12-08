# Commit Convention Guide

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

- **type**: The type of change (required)
- **scope**: The area of the codebase affected (optional)
- **subject**: A brief description of the change (required)
- **body**: A detailed description of the change (optional)
- **footer**: Breaking changes and issue references (optional)

## Commit Types

| Type       | Description                                       | Example                                      |
| ---------- | ------------------------------------------------- | -------------------------------------------- |
| `feat`     | New feature                                       | `feat(auth): add Google OAuth login`         |
| `fix`      | Bug fix                                           | `fix(dashboard): resolve data loading issue` |
| `docs`     | Documentation changes                             | `docs(readme): update installation steps`    |
| `style`    | Code style changes (formatting, semicolons, etc.) | `style(components): format with Biome`       |
| `refactor` | Code refactoring without changing functionality   | `refactor(api): simplify error handling`     |
| `perf`     | Performance improvements                          | `perf(queries): optimize database queries`   |
| `test`     | Adding or updating tests                          | `test(auth): add login flow tests`           |
| `build`    | Build system or dependency changes                | `build(deps): upgrade React to v19`          |
| `ci`       | CI/CD configuration changes                       | `ci(github): add automated testing workflow` |
| `chore`    | Maintenance tasks                                 | `chore(deps): update dependencies`           |
| `revert`   | Revert a previous commit                          | `revert: revert "feat(auth): add OAuth"`     |

## Scope Guidelines

The scope should indicate the area of the codebase affected:

- `auth` - Authentication and authorization
- `dashboard` - Dashboard page and components
- `duas` - Duas-related features
- `challenges` - Challenges functionality
- `activities` - Activities features
- `ui` - UI components
- `api` - API integration
- `db` - Database changes
- `config` - Configuration files
- `deps` - Dependencies

## Subject Guidelines

- Use imperative, present tense: "add" not "added" or "adds"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 100 characters
- Be concise but descriptive

### ✅ Good Examples

```
feat(auth): add password reset functionality
fix(dashboard): resolve infinite loading state
docs(api): document authentication endpoints
refactor(components): extract reusable Button component
perf(queries): add database indexes for faster lookups
```

### ❌ Bad Examples

```
Added new feature
fix: Fixed bug
feat(auth): Added the password reset functionality feature.
Update stuff
WIP
```

## Body Guidelines

- Use the body to explain **what** and **why**, not **how**
- Wrap at 72 characters
- Separate from subject with a blank line
- Can include multiple paragraphs

### Example with Body

```
feat(challenges): add progress tracking

Implement a new progress tracking system that allows users to:
- View their completion percentage
- Track daily streaks
- See historical progress data

This feature uses local storage for offline support and syncs
with Supabase when online.
```

## Footer Guidelines

### Breaking Changes

Breaking changes should be indicated with `BREAKING CHANGE:` in the footer:

```
feat(api): change authentication endpoint structure

BREAKING CHANGE: The /api/auth endpoint now requires a different
request format. Update client code to use the new structure:
{ email: string, password: string } instead of { username, password }
```

### Issue References

Reference issues and pull requests in the footer:

```
fix(dashboard): resolve data loading issue

Fixes #123
Closes #456
Related to #789
```

## Complete Examples

### Simple Feature

```
feat(duas): add favorite duas list
```

### Bug Fix with Details

```
fix(auth): prevent duplicate login requests

Add request debouncing to prevent multiple simultaneous login
attempts when user clicks the login button rapidly.

Fixes #234
```

### Breaking Change

```
feat(api): migrate to Supabase v2

Update all API calls to use Supabase v2 client. This includes
changes to authentication, real-time subscriptions, and storage.

BREAKING CHANGE: Supabase v1 client is no longer supported.
Update your environment variables to use v2 credentials.

Closes #567
```

### Refactoring

```
refactor(components): extract common hooks

Extract useAuth and useSupabase hooks from components into
separate files for better reusability and testing.
```

## Pre-commit Validation

This project uses **commitlint** to automatically validate commit messages. Commits that don't follow the convention will be rejected.

### Bypass Validation (Not Recommended)

In exceptional cases, you can bypass validation:

```bash
git commit --no-verify -m "your message"
```

> [!WARNING]
> Only bypass validation when absolutely necessary. Consistent commit messages are important for:
>
> - Automated changelog generation
> - Understanding project history
> - Semantic versioning
> - Team collaboration

## Tools and Automation

- **Husky**: Manages Git hooks
- **commitlint**: Validates commit messages
- **Biome**: Fast linter and formatter for code quality

## Best Practices

1. **Commit often**: Make small, focused commits
2. **One change per commit**: Don't mix multiple unrelated changes
3. **Test before committing**: Ensure your code works
4. **Write meaningful messages**: Help future developers (including yourself)
5. **Use the body for context**: Explain complex changes
6. **Reference issues**: Link commits to issue tracker

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Semantic Versioning](https://semver.org/)
