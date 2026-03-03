#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
GITIGNORE_FILE="${REPO_ROOT}/.gitignore"

if [[ ! -f "${GITIGNORE_FILE}" ]]; then
  echo ".gitignore is missing. Commit is blocked."
  exit 1
fi

if [[ ! -s "${GITIGNORE_FILE}" ]]; then
  echo ".gitignore is empty. Commit is blocked."
  exit 1
fi

exit 0

