# Tools Directory

This directory contains utility scripts for project validation and maintenance
tasks.

## Scripts

### `validate-workspace.ts`

Validates that VS Code extension recommendations in `.vscode/extensions.json`
match the extensions configured in `.devcontainer/devcontainer.json`. This
ensures consistency between the workspace recommendations and the dev container
environment.

**Usage:**

```bash
npm run validate:workspace
```

**Automated execution:**

- Runs automatically in CI/CD pipeline via GitHub Actions
- Can be run locally during development

This validation helps prevent issues where extensions are out of sync between
different development environments.
