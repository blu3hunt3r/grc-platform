#!/bin/bash

# Setup script for GRC Platform
# Run this after adding your environment variables

set -e

echo "🚀 GRC Platform Setup"
echo "====================="

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔧 Generating Prisma client..."
cd packages/database
pnpm prisma generate
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy apps/web/.env.example to apps/web/.env.local"
echo "2. Add your API keys (Clerk, Neon, Anthropic)"
echo "3. Run: pnpm db:push (to create database schema)"
echo "4. Run: pnpm dev (to start development)"
echo ""
