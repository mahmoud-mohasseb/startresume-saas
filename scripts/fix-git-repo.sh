#!/bin/bash

# Fix Git Repository - Remove Large Files and Clean Up
echo "🧹 Fixing Git Repository - Removing Large Files"
echo "================================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Remove files from git cache that should be ignored
echo "🔄 Step 1: Removing cached files that should be ignored..."

# Remove .next directory from git
if [ -d ".next" ]; then
    echo "   Removing .next/ from git cache..."
    git rm -r --cached .next/ 2>/dev/null || echo "   .next/ not in git cache"
fi

# Remove node_modules from git
if [ -d "node_modules" ]; then
    echo "   Removing node_modules/ from git cache..."
    git rm -r --cached node_modules/ 2>/dev/null || echo "   node_modules/ not in git cache"
fi

# Remove TypeScript build info
echo "   Removing TypeScript build files..."
git rm --cached *.tsbuildinfo 2>/dev/null || echo "   No .tsbuildinfo files in cache"

# Remove pnpm lock file (it's large and can be regenerated)
echo "   Removing pnpm-lock.yaml from git cache..."
git rm --cached pnpm-lock.yaml 2>/dev/null || echo "   pnpm-lock.yaml not in cache"

# Remove any .DS_Store files
echo "   Removing .DS_Store files..."
find . -name ".DS_Store" -exec git rm --cached {} \; 2>/dev/null || echo "   No .DS_Store files in cache"

echo "✅ Step 1 completed"
echo ""

# Step 2: Clean up local files
echo "🔄 Step 2: Cleaning up local files..."

# Remove .next build cache
if [ -d ".next" ]; then
    echo "   Removing .next/ directory..."
    rm -rf .next/
fi

# Remove TypeScript build info
echo "   Removing TypeScript build files..."
rm -f *.tsbuildinfo

# Remove .DS_Store files
echo "   Removing .DS_Store files..."
find . -name ".DS_Store" -delete

echo "✅ Step 2 completed"
echo ""

# Step 3: Add updated .gitignore
echo "🔄 Step 3: Adding updated .gitignore..."
git add .gitignore
echo "✅ Step 3 completed"
echo ""

# Step 4: Commit the cleanup
echo "🔄 Step 4: Committing cleanup changes..."
git add -A
git commit -m "🧹 Clean up repository: remove large files and update .gitignore

- Remove .next/ build cache from git
- Remove node_modules/ from git tracking  
- Remove TypeScript build artifacts
- Update .gitignore with comprehensive rules
- Fix GitHub file size limit issues"

echo "✅ Step 4 completed"
echo ""

# Step 5: Show repository status
echo "📊 Repository Status:"
echo "===================="
git status --porcelain
echo ""

# Step 6: Check for large files
echo "🔍 Checking for remaining large files..."
echo "======================================="

# Find files larger than 50MB
large_files=$(find . -type f -size +50M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null)

if [ -z "$large_files" ]; then
    echo "✅ No large files found (>50MB)"
else
    echo "⚠️  Large files still present:"
    echo "$large_files"
    echo ""
    echo "💡 Consider adding these to .gitignore or using Git LFS"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Review the changes: git log --oneline -5"
echo "2. Push to GitHub: git push origin main"
echo "3. If you still get errors, you may need to force push: git push --force-with-lease origin main"
echo ""
echo "⚠️  WARNING: Force push will rewrite history. Only use if you're sure!"
echo ""
echo "✅ Repository cleanup completed!"
