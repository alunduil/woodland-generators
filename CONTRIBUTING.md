# Contributing to Woodland Generators

Thank you for your interest in contributing! This guide covers everything you
need to know about developing and testing this FoundryVTT module.

**New to open source?** Check out these friendly resources:  
[How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)  
and [First Timers Only](http://www.firsttimersonly.com/)

**Security Issues:** If you find a security vulnerability, please email  
the maintainer directly instead of opening a public issue.

## Quick Start

1. **Fork and clone** the repository
2. **Set up development environment**: `npm install`
3. **Make your changes** with live compilation: `npm run build:watch`
4. **Test your changes**: Create a pull request - our automated workflow will  
   provide testing instructions and URLs for FoundryVTT
5. **Submit a pull request** following our issue templates

## Development Workflow

### For Maintainers

- [How to Create Releases](docs/how-to-create-releases.md)
- [How to Submit to Package Repository](docs/how-to-submit-to-package-repository.md)

## Code Standards

This project maintains high code quality through automated tools:

- **TypeScript**: Compile-time type checking
- **ESLint**: Code linting and style enforcement
- **Prettier**: Consistent code formatting
- **Pre-commit hooks**: Automatic validation before commits

Run `npm run validate` to check everything locally.

## Getting Help

- **Questions?** Use the [Question template][question-template]
- **Bug reports?** Use the [Bug Report template][bug-template]
- **Feature requests?** Use the [Feature Request template][feature-template]

[question-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=question.yml
[bug-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=bug_report.yml
[feature-template]:
  https://github.com/alunduil/woodland-generators/issues/new?template=feature_request.yml
