# Contributing Guidelines

Thank you for your interest in contributing to the Islamic Dua App!

## ⚠️ Important Note on Permissions

**This repository is publicly available, but write access is restricted.**

- **Merge Permissions**: Only the repository owner has permission to merge Pull Requests.
- **Pull Requests**: Anyone can submit a Pull Request (PR), but it must be reviewed and approved by the owner.
- **Issues**: Anyone can create an issue directly.

## Getting Started

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally.
    ```bash
    git clone https://github.com/YOUR_USERNAME/islamic-dua-app.git
    cd islamic-dua-app
    ```
3.  **Install dependencies**.
    ```bash
    npm install
    ```
4.  **Create a branch** for your work.

## Branching Strategy

We use a strict naming convention for branches. Please use the following prefixes:

- `feat/`: New features (e.g., `feat/add-dark-mode`)
- `fix/`: Bug fixes (e.g., `fix/login-error`)
- `docs/`: Documentation changes (e.g., `docs/update-readme`)
- `style/`: Formatting, missing semi colons, etc; no code change
- `refactor/`: Refactoring production code
- `test/`: Adding missing tests, refactoring tests; no production code change
- `chore/`: Updating build tasks, package manager configs, etc; no production code change

**Example:**

```bash
git checkout -b feat/audio-player-controls
```

## Pull Request Process

1.  Ensure your code follows the project's style and conventions.
2.  Run checks locally before pushing:
    ```bash
    npm run validate
    ```
3.  Push to your fork and submit a Pull Request to the `main` branch.
4.  Fill out the **Pull Request Template** completely.
5.  Wait for review. The owner will review your PR and may request changes.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `<type>(<scope>): <subject>`

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Examples:**

- `feat(auth): support google login`
- `fix(api): handle timeout correctly`

## Code of Conduct

Please note that this project is released with a [Code of Conduct](../CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
