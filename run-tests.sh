#!/bin/bash

echo "🧪 Running StartResume.io Comprehensive Test Suite..."
echo "=================================================="

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Run the comprehensive test suite
node tests/app.test.js

echo ""
echo "🎯 Test completed! Check the results above."
echo "=================================================="
