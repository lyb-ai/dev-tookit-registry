# Getting Started

## Introduction

This registry is designed to be used as a **source code generator** rather than a runtime dependency. Instead of installing a package, you pull the TypeScript source code of hooks and utilities directly into your project using the CLI. This allows for full control and customization of the code.

## CLI Usage

### 1. Initialize

First, initialize the dev-tookit CLI in your project root:

```bash
npx dev-tookit init
```

### 2. Add Components

Use the CLI to pull and inject source code into your project.

**Add a Hook:**

```bash
# Automatically handles internal dependencies
npx dev-tookit add hook useLocalStorage
```

**Add a Utility:**

```bash
# Use --force to overwrite existing files
npx dev-tookit add util formatDate --force
```

### 3. List Components

View all available components in the registry:

```bash
npx dev-tookit list
```

## How It Works

The CLI requests metadata from the registry's `index.json`. Based on your project's `aliases` and `paths` configuration (defined in `dev-tookit.json` or similar), it:

1. Downloads the source code.
2. Resolves internal dependencies (e.g., if a hook uses a utility).
3. Rewrites import paths to match your local project structure (e.g., changing `@/utils/isBrowser` to your local utility path).
