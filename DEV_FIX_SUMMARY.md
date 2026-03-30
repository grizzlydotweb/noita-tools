# Noitool Dev Environment Fix Summary

## Changes Made

### 1. Backend Patreon Integration (server/patreon.mjs)

**Problem:** Server crashed on startup if Patreon API keys were missing.

**Fix:** Modified `TokenManager` class to:

- Add `isConfigured` flag to track if credentials are present
- Show warning message instead of throwing error when credentials missing
- Skip all Patreon operations gracefully when not configured
- Return empty data for API calls when not configured

**Result:** Server starts successfully even without Patreon env vars.

### 2. Frontend Patreon Integration (src/components/Profile/index.tsx)

**Problem:** Frontend crashed if Patreon OAuth client ID was missing.

**Fix:** Modified `oauthLink()` and `LinkPatreon()`:

- Added null checks for environment variables
- Return "#" and log warning instead of crashing
- Show user-friendly message when Patreon not configured
- Only show "Connect Patreon" button when properly configured

**Result:** UI loads successfully and shows helpful message instead of crashing.

### 3. Discord Integration (server/index.mjs)

**Problem:** Discord had conditional loading but no warning message when skipped.

**Fix:** Added warning message when Discord integration is disabled due to missing env vars.

**Result:** Clear feedback about Discord status on startup.

### 4. Development Tools

**Problem:** chokidar-cli was not installed globally for Node 22.

**Fix:** `npm install -g chokidar-cli` in Node 22 environment.

**Result:** C++ file watching now works during development.

## Validation

Run the validation script to verify all fixes:

```bash
source ~/.nvm/nvm.sh && nvm use 22 && ./validate-setup.sh
```

## Testing

The dev server now runs successfully without API keys:

```bash
source ~/.nvm/nvm.sh && nvm use 22 && npm run dev
```

All three components start:

- ✅ **Backend server** on port 3001 (shows warnings for missing Patreon/Discord)
- ✅ **Vite dev server** on port 3000 (finds alternative if occupied)
- ✅ **C++ watcher** (monitors C++ files for WASM rebuilds)

## Missing API Keys Behavior

### Without Patreon keys (`VITE_PATREON_ID`, `VITE_PATREON_REDIRECT_URL`):

- **Frontend:** Shows friendly warning message
- **Backend:** Shows "Patreon OAuth client ID and secret not configured" warning, returns empty patron list

### Without Discord keys (`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`):

- **Backend:** Shows "Discord integration disabled" message, skips Discord bot

### Without Backblaze B2 keys (`B2_APP_KEY_ID`, `B2_APP_KEY`):

- **Backend:** Uses alternative file storage (as per existing code)

## No Functional Impact

Features requiring API keys are disabled, but the core app functionality works fully:

- Seed search and analysis
- Map generation
- All game system info providers
- UI and user interactions

## Environment Variables

Copy `.env.example` to `.env` and fill in values as needed:

```bash
cp .env.example .env
```
