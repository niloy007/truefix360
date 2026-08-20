#!/usr/bin/env bash
set -u
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/niloy/Projects/truefix360
OUT=.verify-users.txt
{
  echo "npm=$(which npm)"
  npm test
  echo "TEST_EXIT:$?"
  npx tsc --noEmit
  echo "TSC_EXIT:$?"
  nmp run lint
  echo "LINT_EXIT:$?"
  npm run build
  echo "BUILD_EXIT:$?"
} > "$OUT" 2>&1
echo DONE >> "$OUT"
wc -l "$OUT"
