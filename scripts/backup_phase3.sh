#!/usr/bin/env bash
# backup_phase3.sh – creates a zip of the src directory and commits it
set -e
TIMESTAMP=
ZIP_NAME="backup_phase3_.zip"
zip -r "" src > /dev/null
git add .
git commit -m "backup-before-academic-tracker"
 echo "Backup created: "
