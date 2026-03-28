# Agent Memories

This directory contains learned knowledge for agents working in this repo.

## Structure

- `repo/` -- Safe to commit. General tool knowledge, error fixes, patterns, and conventions that don't contain personal or customer data.
- `private/` -- **Gitignored.** Contains memories with sensitive information (customer names, IDs, emails, account details, personal workflow notes). Always check this directory alongside `repo/`.

## For Agents

Read both `repo/` and `private/` before starting any task. The `private/` directory may not exist in a fresh clone -- that's expected. The `invoicing-config.json` in the project root also contains sensitive saved defaults and is gitignored.
