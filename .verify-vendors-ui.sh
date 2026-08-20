#!/usr/bin/env bash
set +e
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd /home/niloy/Projects/truefix360
OUT=/home/niloy/Projects/truefix360/.verify-vendors-ui.txt
{
  echo "=== npm test ==="
  npm test
  echo "TEST_EXIT=$?"
  echo ""
  echo "=== npx tsc --noEmit ==="
  npx tsc --noEmit
  echo "TSC_EXIT=$?"
  echo ""
  echo "=== npm run lint ==="
  npm run lint
  echo "LINT_EXIT=$?"
  echo ""
  echo "=== npm run build ==="
  npm run build
  echo "BUILD_EXIT=$?"
  echo "DONE"
} > "$OUT" 2>&1