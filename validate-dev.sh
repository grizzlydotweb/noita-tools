#!/usr/bin/env bash
# Validate the dev server setup without running it - Fixed version

source ~/.nvm/nvm.sh
nvm use 22

echo "=== Validating Noitool Dev Setup ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo ""
echo "=== Checking environment variables ==="
if [ -z "$PATREON_CLIENT_ID" ]; then
  echo "⚠️  PATREON_CLIENT_ID not set (Patreon integration will be disabled)"
else
  echo "✓ PATREON_CLIENT_ID is set"
fi

if [ -z "$PATREON_CLIENT_SECRET" ]; then
  echo "⚠️  PATREON_CLIENT_SECRET not set (Patreon integration will be disabled)"
else
  echo "✓ PATREON_CLIENT_SECRET is set"
fi

echo ""
echo "=== Testing server startup briefly ==="
timeout 3s node --experimental-modules ./server/index.mjs > /tmp/server-test.log 2>&1 &
SERVER_PID=$!
sleep 2
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✓ Server started successfully (PID: $SERVER_PID)"
  kill $SERVER_PID 2>/dev/null
  sleep 1
  echo "Server output preview:"
  head -10 /tmp/server-test.log | grep -E "(Patreon|Discord|listening|error|Error)" | head -5
else
  echo "✗ Server failed to start properly"
  echo "Error log:"
  cat /tmp/server-test.log
fi

echo ""
echo "=== Testing vite build ==="
if npx vite --version &> /dev/null; then
  echo "✓ Vite is installed and working"
  echo "Vite version: $(npx vite --version)"
else
  echo "✗ Vite has issues"
fi

echo ""
echo "=== Testing chokidar ==="
if command -v chokidar &> /dev/null; then
  echo "✓ chokidar is installed"
  echo "chokidar version: $(chokidar --version 2>/dev/null || echo 'version check unavailable')"
else
  echo "✗ chokidar is not available (needed for C++ file watching)"
fi

echo ""
echo "=== Summary ==="
echo "To start the dev server, you have these options:"
echo ""
echo "1. All components (server + frontend + C++ watcher):"
echo "   source ~/.nvm/nvm.sh && nvm use 22 && npm run dev"
echo ""
echo "2. Server + frontend only (no C++ rebuilding):"
echo "   source ~/.nvm/nvm.sh && nvm use 22 && npm run dev-win"
echo ""
echo "3. Run components separately in different terminals:"
echo "   Terminal 1: source ~/.nvm/nvm.sh && nvm use 22 && nodemon --experimental-modules ./server/index.mjs"
echo "   Terminal 2: source ~/.nvm/nvm.sh && nvm use 22 && npx vite"
echo ""
echo "The server will show warnings for missing Patreon/Discord API keys but will run fine."
echo "Visit http://localhost:3000 (or the port shown) after all services start."