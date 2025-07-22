# Contributing to woodland generators

Thank you for your interest in contributing! This guide covers everything you
need to know about developing and testing this FoundryVTT module.

**New to open source?** Check out these friendly resources:  
[How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)  
and [First Timers Only](http://www.firsttimersonly.com/)

**Security Issues:** If you find a security vulnerability, please email  
the maintainer directly instead of opening a public issue.

## Quick start

1. **Fork and clone** the repository
2. **Set up development environment**: `npm install`
3. **Make your changes** with live compilation: `npm run build:watch`
4. **Test your changes**: Create a pull request - the automated workflow will  
   provide testing instructions and URLs for FoundryVTT
5. **Submit a pull request** following the issue templates

## Development workflow

### For maintainers

- [How to Create Releases](docs/how-to-create-releases.md)
- [How to Submit to Package Repository](docs/how-to-submit-to-package-repository.md)

## Code standards

This project maintains high code quality through automated tools:

- **TypeScript**: Compile-time type checking
- **ESLint**: Code linting and style enforcement
- **Prettier**: Consistent code formatting
- **Vale**: Prose linting for documentation quality
- **Pre-commit hooks**: Automatic validation before commits

Run `npm run validate` to check everything locally.

### Writing documentation

For prose linting, Vale automatically checks documentation. To add
project-specific terms (like "FoundryVTT," "woodland," etc.), add them to
`.vale/styles/config/vocabularies/Custom/accept.txt`.

You can also disable Vale for specific content using markup comments:

```markdown
<!-- vale off -->

Technical content that should skip prose linting.

<!-- vale on -->
```

## Getting help

- **Questions?** Use the [Question template][question-template]
- **Bug reports?** Use the [Bug Report template][bug-template]
- **Feature requests?** Use the [Feature Request template][feature-template]

[question-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=question.yml
[bug-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=bug_report.yml
[feature-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=feature_request.yml
