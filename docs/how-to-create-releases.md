# How to Create Releases

This guide explains how to create and publish releases for the Woodland
Generators module.

## Prerequisites

- You have maintainer access to the GitHub repository
- The module has been tested and is ready for release
- You have updated the version number in `module.json` and `package.json`

## Creating a GitHub Release

### Step 1: Open the Releases Page

Navigate to your repository's releases page by clicking the "Releases" section
in the right sidebar of your GitHub repository.

![Where to click to open repository releases.](https://user-images.githubusercontent.com/7644614/93409301-9fd25080-f864-11ea-9e0c-bdd09e4418e4.png)

### Step 2: Draft a New Release

Click the "Draft a new release" button.

![Draft a new release button.](https://user-images.githubusercontent.com/7644614/93409364-c1333c80-f864-11ea-89f1-abfcb18a8d9f.png)

### Step 3: Configure the Release

Fill out the release form:

- **Tag name**: Use semantic versioning (e.g., `v1.0.0`)
- **Release title**: Descriptive title for the release
- **Description**: Add release notes describing changes

![Release Creation Form](https://user-images.githubusercontent.com/7644614/93409543-225b1000-f865-11ea-9a19-f1906a724421.png)

### Step 4: Publish the Release

Click "Publish release" to create the release.

### Step 5: Wait for Automation

A GitHub Action will automatically:

- Update the `module.json` with correct download URLs
- Create a `module.zip` file
- Make the release available for distribution

Monitor the progress in the "Actions" tab of your repository.

![Actions Tab](https://user-images.githubusercontent.com/7644614/93409820-c1800780-f865-11ea-8c6b-c3792e35e0c8.png)

### Step 6: Get the Distribution URLs

Once the action completes, you can find the manifest URL on the release page.

![image](https://user-images.githubusercontent.com/7644614/93409960-10c63800-f866-11ea-83f6-270cc5d10b71.png)

## Distribution URLs

- **Specific version**:
  `https://github.com/alunduil/woodland-generators/releases/download/v1.0.0/module.json`
- **Latest version**:
  `https://github.com/alunduil/woodland-generators/releases/latest/download/module.json`

Use the latest version URL for general distribution, as it will automatically
point to the newest release.

## Troubleshooting

- If the GitHub Action fails, check the Actions tab for error logs
- Ensure all required files are present in the repository
- Verify that the version numbers are valid semantic versions
