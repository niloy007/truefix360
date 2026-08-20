#!/usr/bin/env bash
set -u
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/niloy/Projects/truefix360 || exit 99

if ! command -v npm >/dev/null 2>&1; then
  NPM_BIN=$(ls /home/niloy/.nvm/versions/node/*/bin/npm 2>/dev/null | head -1)
  if [ -z "$NPM_BIN" ]; then
    NPM_BIN=$(find /home/niloy -name npm 2>/dev/null | head -1)
  fi
  echo "FOUND_NPM=$NPM_BIN"
  if [ -n "$NPM_BIN" ]; then
    export PATH="$(dirname "$NPM_BIN"):$PATH"
  fi
fi

echo "WHICH_NPM=$(command -v npm || true)"
npm --version || true

npm test > /tmp/truefix_test.out 2>&1
echo "TEST_EXIT:$?"

npx tsc --noEmit > /tmp/truefix_tsc.out 2>&1
echo "TSC_EXIT:$?"

npm run lint > /tmp/truefix_lint.out 2>&1
echo "LINT_EXIT:$?"

npm run build > /tmp/truefix_build.out 2>&1
echo "BUILD_EXIT:$?"

echo "=== DONE ==="
