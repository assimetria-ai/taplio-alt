#!/bin/bash
# Start server in background
cd api && node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Test the /login endpoint
echo "Testing /login endpoint..."
curl -i http://localhost:3001/login

# Clean up
kill $SERVER_PID 2>/dev/null
