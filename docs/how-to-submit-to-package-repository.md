# How to submit your module to FoundryVTT package repository

This guide explains how to list your module in the official FoundryVTT package
repository so users can discover and install it directly from within Foundry.

## Prerequisites

- Your module has at least one published release
- The module works correctly with the supported FoundryVTT versions
- You have the manifest URL for your module

## Initial package submission

### Step 1: Access the submission form

Navigate to the
[Package Submission Form](https://foundryvtt.com/packages/submit). You can also
find this link at the bottom of the
[Systems and Modules](https://foundryvtt.com/packages/) page on the Foundry
website.

### Step 2: Complete the submission form

Fill out the form with the following information:

- **Package Name**: Must exactly match the `id` field in your `module.json` file
- **Package Title**: The display name users will see (can provide more description
  than the package name)
- **Package URL**: Your GitHub repository URL
- **Description**: Brief explanation of what your module does
- **Manifest URL**: The URL to your `module.json` manifest file

![Package submission form example](https://user-images.githubusercontent.com/36359784/120664263-b49e5500-c482-11eb-9126-af7006389903.png)

### Step 3: Submit and wait for review

After submitting the form, Foundry staff will review your submission. This
typically takes a few days. They may:

- Approve your submission immediately
- Ask for clarifications or changes
- Request more information

## Managing your package after approval

Once approved, you'll gain access to the
[module admin page](https://foundryvtt.com/admin/packages/package/) where you
can manage your package.

### Adding new versions

To release a new version:

1. Navigate to your module's admin page
1. Scroll to the bottom to find the "Package Versions" section
1. Fill in the new version information:
   - **Version**: The version number (must match your release tag)
   - **Manifest URL**: The manifest URL for **that specific version** (not the
     `/latest/` URL)

![Version management interface](https://user-images.githubusercontent.com/36359784/120664346-c4b63480-c482-11eb-9d8b-731b50d70939.png)

1. Click "Save" to publish the new version

### Important notes about manifest URLs

> ⚠️ **Critical**: Always use the specific release manifest URL, not the
> `/latest/` URL when listing new versions.

**Correct**:
`https://github.com/alunduil/woodland-generators/releases/download/v1.0.0/module.json`

**Incorrect**:
`https://github.com/alunduil/woodland-generators/releases/latest/download/module.json`

This ensures proper version tracking and prevents installation issues. For more
details, read the
[FoundryVTT wiki article on releases and history](https://foundryvtt.wiki/en/development/guides/releases-and-history).

## What happens after publishing

When you publish a new version:

- Users installing your module from within Foundry will get the new version
- The system posts an announcement in the #release-announcements channel on the
  official FoundryVTT Discord server
- The system updates the package listing to show the new version

## Troubleshooting common issues

- **Package name mismatch**: Make sure the package name exactly matches your
  `module.json` `id` field
- **Manifest not found**: Verify your manifest URL works and returns
  valid JSON
- **Version conflicts**: Make sure version numbers match between your
  release tag and `module.json`
- **Access issues**: Contact FoundryVTT support if you lose access to your
  package admin page
