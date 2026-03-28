---
description: When writing to memories/ or invoicing-config.json -- ensures sensitive data goes to the gitignored private directory
globs:
  - memories/**
  - invoicing-config.json
alwaysApply: false
---

# Sensitive Data in Memories

When recording memories, any content that contains customer names, email addresses, Wave IDs, Slack user/channel IDs, account numbers, or other personal/business-specific information must be written to `memories/private/` (gitignored), never to `memories/repo/` (tracked by git).

`memories/repo/` is only for general tool knowledge, error fixes, and conventions that contain no identifying information. See `memories/README.md` for the full structure.
