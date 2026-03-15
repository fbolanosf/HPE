#!/bin/bash
# Launcher for HPE Sales Specialist App

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the app directory
cd "$DIR/sales-app"

# Start the server in the background
echo "Starting HPE Sales App server..."
npm run dev &
SERVER_PID=$!

# Wait for 5 seconds to let the server initialize
echo "Waiting for server to initialize..."
sleep 5

# Open the browser
echo "Opening application in browser..."
open "http://localhost:3002"

# Wait for the server process to ensure the terminal stays open
wait $SERVER_PID
