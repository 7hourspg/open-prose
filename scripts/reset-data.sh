#!/usr/bin/env bash
#
# Wipe the local Open Prose data directory so the app launches as a fresh
# install (zero projects, no firstRunCompleted flag → onboarding triggers).
#
# Refuses to run if the app is currently open.

set -euo pipefail

case "$OSTYPE" in
  darwin*)  DATA_DIR="$HOME/Library/Application Support/OpenProse" ;;
  msys*|cygwin*|win32*)
            DATA_DIR="${APPDATA:-$HOME/AppData/Roaming}/OpenProse" ;;
  linux*)   DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/OpenProse" ;;
  *)
    echo "Unsupported OS: $OSTYPE" >&2
    exit 1
    ;;
esac

if pgrep -fi 'openprose' >/dev/null 2>&1; then
  echo "Open Prose is currently running. Quit it first (Cmd+Q on macOS), then re-run this script."
  exit 1
fi

if [ ! -d "$DATA_DIR" ]; then
  echo "No data dir at $DATA_DIR — nothing to clear."
  exit 0
fi

if [ "${1:-}" != "--yes" ]; then
  echo "About to delete:"
  echo "  $DATA_DIR"
  echo
  echo "This wipes all local projects, posts, settings, and uploaded media."
  read -r -p "Continue? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *)
      echo "Aborted."
      exit 0
      ;;
  esac
fi

BACKUP="${DATA_DIR}.bak.$(date +%s)"
mv "$DATA_DIR" "$BACKUP"
echo "Moved → $BACKUP"
echo "Restore with:  rm -rf '$DATA_DIR' && mv '$BACKUP' '$DATA_DIR'"
echo
echo "Launch the app — it should land on the welcome screen."
