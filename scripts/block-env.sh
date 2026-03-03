#!/usr/bin/env bash
set -euo pipefail

# Block if any environment files are tracked or staged.
# This targets common .env patterns used in Node/Next.js projects.

tracked_env_files="$(git ls-files -- '*.env' '.env.*' '.env' 2>/dev/null || true)"

staged_env_files="$(git diff --cached --name-only -- '*.env' '.env.*' '.env' 2>/dev/null || true)"

if [[ -n "${tracked_env_files}" || -n "${staged_env_files}" ]]; then
  echo "Environment files must not be committed."
  echo "The following environment-like files are tracked or staged:"
  if [[ -n "${tracked_env_files}" ]]; then
    echo "${tracked_env_files}"
  fi
  if [[ -n "${staged_env_files}" ]]; then
    echo "${staged_env_files}"
  fi
  echo
  echo "Remove them from git with commands like:"
  echo "  git rm --cached <file>"
  echo "and ensure they are listed in .gitignore."
  exit 1
fi

exit 0

