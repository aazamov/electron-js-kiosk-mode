#!/bin/bash
echo "Building Secure Kiosk..."
echo ""

# Clean previous builds
rm -rf dist

# Install dependencies if needed
npm install

# Build for current platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Building for macOS..."
    npm run dist:mac
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Building for Linux..."
    npm run dist:linux
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "Building for Windows..."
    npm run dist:win
else
    echo "Building for all platforms..."
    npm run dist
fi

echo ""
echo "Build complete! Check the 'dist' folder for the installer."
