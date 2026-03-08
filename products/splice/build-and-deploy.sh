#!/bin/bash
# Splice Build and Deploy Script
# Builds the React client and copies it to the server's public directory

set -e  # Exit on error

echo "🔨 Building Splice..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Build the client
echo "📦 Building client..."
cd client
npm install --prefer-offline
npm run build
echo "✅ Client built successfully"

# Copy to server public directory
echo "📂 Copying build to server/public..."
cd ..
rm -rf server/public
cp -r client/dist server/public
echo "✅ Copied to server/public"

# Verify
if [ -f "server/public/index.html" ]; then
  BUNDLE_COUNT=$(ls server/public/assets/index-*.js 2>/dev/null | wc -l)
  echo "✅ Deployment ready: index.html + $BUNDLE_COUNT JS bundle(s)"
  echo ""
  echo "🚀 To start the server in production mode:"
  echo "   cd server && NODE_ENV=production npm start"
else
  echo "❌ ERROR: Build verification failed"
  exit 1
fi
