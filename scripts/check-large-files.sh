#!/usr/bin/env bash
set -euo pipefail

# Threshold: 5 MiB
MAX_SIZE_BYTES=$((5 * 1024 * 1024))

large_files=()

while IFS= read -r -d '' file; do
  # Skip if the file no longer exists (e.g., deleted in this commit)
  if [[ ! -f "${file}" ]]; then
    continue
  fi

  size_bytes=$(stat -c%s "${file}")
  if (( size_bytes > MAX_SIZE_BYTES )); then
    large_files+=("${file} (${size_bytes} bytes)")
  fi
done < <(git ls-files -z)

if (( ${#large_files[@]} > 0 )); then
  echo "The following tracked files are larger than 5MB and are blocked:"
  for f in "${large_files[@]}"; do
    echo "  - ${f}"
  done
  echo
  echo "Consider using an external storage service or Git LFS instead of committing large binaries."
  exit 1
fi

exit 0

