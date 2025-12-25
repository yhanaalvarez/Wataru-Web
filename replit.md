# MACKY AI - Web Chat Bot

## Overview

MACKY AI is a web-based chat bot application built with Node.js and Express. It provides an AI-powered chat interface with support for multiple AI integrations (ChatGPT, Gemini), OAuth authentication (Google, GitHub), gaming/casino features, and an admin dashboard for feature management. The application uses a command-based architecture similar to Discord bots, where commands are loaded dynamically from the filesystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Entry Point
- **index.js**: Process wrapper that spawns the main application and handles automatic restarts on exit code 1
- **main.js**: Express server configuration, middleware setup, and route mounting

### Command System
The bot uses a modular command architecture:
- Commands are stored in `app/cmd/` directory as individual JS files
- Each command exports a `meta` object (name, aliases, description, category) and an `onStart` function
- Commands are loaded dynamically at startup via `system/utility/loadAll.js`
- Commands can work with or without a prefix (configurable per command)
- Global command registry stored in `global.client.commands` Map

### Request Flow
1. API requests hit `/api/command` or `/api/event` endpoints
2. Session validation via token-based authentication
3. Command/event handler processes the request
4. Response sent through the `wataru` helper object (abstraction layer for consistent response formatting)

### Authentication
- **OAuth Providers**: Google and GitHub via Passport.js
- **Session-based**: SQLite database stores users and session tokens
- **Token Generation**: Crypto-based random token generation with expiration

### Data Storage
- **SQLite**: Primary database for users and sessions (`system/utility/database.db`)
- **JSON Files**: Configuration and user game data stored in `json/` directory
  - `config.json`: Bot name and prefix settings
  - `api.json`: External API endpoints
  - `users.json`: User profiles, game stats, bank accounts, leaderboards

### Admin System
- PIN-protected admin dashboard (hardcoded PIN: 198970)
- 30+ feature toggles organized by category (AI, Commerce, Dashboard, UI, Security, Features, GitHub)
- Runtime feature enable/disable without restart

### Static Files & Frontend
- Served from `system/public/`
- TailwindCSS via CDN for styling
- Multiple HTML pages: main chat interface, games, news

## External Dependencies

### Core Framework
- **Express 4.x**: Web server framework
- **express-session**: Session management middleware

### Authentication
- **Passport.js**: Authentication middleware
- **passport-google-oauth20**: Google OAuth 2.0 strategy
- **passport-github2**: GitHub OAuth strategy

### Database
- **SQLite3**: Local file-based database for users and sessions

### External APIs
- **Kaiz API** (kaiz-apis.gleeze.com): AI services
- **Ryzen API** (api.ryzen.vip): AI services  
- **Zaikyoo API** (zaikyoo-api.onrender.com): AI services
- **Urangkapolka API**: ChatGPT-4 integration for AI command

### Utilities
- **Axios**: HTTP client for external API calls
- **fs-extra**: Enhanced filesystem operations
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Environment Variables Required
- `SESSION_SECRET`: Express session encryption key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret