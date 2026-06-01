#!/usr/bin/env bash
set -euo pipefail

# Block if any environment files are tracked or staged.
# This targets common .env patterns used in Node/Next.js projects.
# Safe templates (no secrets) are allowed to be committed.

ALLOWED_ENV_TEMPLATES=(
  ".env.example"
  ".env.sample"
  ".env.template"
)

filter_allowed_env_templates() {
  local file
  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    local allowed=0
    for template in "${ALLOWED_ENV_TEMPLATES[@]}"; do
      if [[ "${file}" == "${template}" ]]; then
        allowed=1
        break
      fi
    done
    if [[ "${allowed}" -eq 0 ]]; then
      echo "${file}"
    fi
  done
}

tracked_env_files="$(
  git ls-files -- '*.env' '.env.*' '.env' 2>/dev/null | filter_allowed_env_templates || true
)"

staged_env_files="$(
  git diff --cached --name-only -- '*.env' '.env.*' '.env' 2>/dev/null | filter_allowed_env_templates || true
)"

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

