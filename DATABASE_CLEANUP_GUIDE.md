# 🧹 Database Cleanup Guide for StartResume.io

## ⚠️ IMPORTANT WARNING
**This will DELETE ALL DATA in your database!**
- All user accounts
- All subscriptions  
- All credit history
- All resumes and cover letters
- All feature usage data
- **EVERYTHING!**

## 🔒 Safety Features
- ✅ **Production Protected**: Scripts will NOT run in production environment
- ✅ **Confirmation Required**: Multiple confirmation steps before execution
- ✅ **Environment Check**: Validates you're in development mode
- ✅ **Backup Reminder**: Always backup before running

## 🚀 Quick Start (Recommended)

### Method 1: NPM Script (Easiest)
```bash
npm run db:clean
```

### Method 2: Direct Script
```bash
node scripts/run-database-cleanup.js
```

### Method 3: Shell Script
```bash
./scripts/reset-db.sh
```

## 📋 What Gets Cleaned

### Core Tables:
- `users` - All user accounts and profiles
- `subscriptions` - All subscription data and plans  
- `credit_history` - All credit transactions and usage
- `feature_usage` - All feature usage analytics

### Additional Tables (if they exist):
- `resumes` - All saved resumes
- `cover_letters` - All generated cover letters
- `job_applications` - All job application data

## 🔧 Available Scripts

### 1. Interactive Cleanup Script
**File**: `/scripts/run-database-cleanup.js`
- ✅ Interactive confirmation prompts
- ✅ Multiple safety checks
- ✅ Verification after cleanup
- ✅ Detailed progress reporting

### 2. SQL Cleanup Script  
**File**: `/scripts/clean-database.sql`
- ✅ Direct SQL commands
- ✅ Sequence resets
- ✅ Verification queries
- ✅ Statistics cleanup

### 3. API Cleanup Endpoint
**File**: `/app/api/admin/clean-database/route.ts`
- ✅ HTTP API for cleanup
- ✅ Admin key protection
- ✅ Development-only access
- ✅ JSON response format

### 4. Shell Script
**File**: `/scripts/reset-db.sh`
- ✅ One-command execution
- ✅ Environment validation
- ✅ Multiple cleanup methods
- ✅ Simple confirmation

## 🛡️ Security Features

### Environment Protection:
```javascript
// Production check
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'Database cleanup not allowed in production' },
    { status: 403 }
  )
}
```

### Admin Key Protection:
```javascript
// Requires admin key
if (adminKey !== process.env.ADMIN_CLEANUP_KEY) {
  return NextResponse.json(
    { error: 'Invalid admin key' },
    { status: 401 }
  )
}
```

## 📊 Verification Process

After cleanup, the scripts will verify:
- Row counts for all tables (should be 0)
- Database statistics reset
- Sequence counters reset to 1
- No orphaned data remaining

## 🔄 Post-Cleanup Steps

1. **Verify Cleanup**: Check that all tables are empty
2. **Test Application**: Ensure app works with clean database
3. **Create Test Users**: Add sample data for testing
4. **Verify Features**: Test all features work correctly

## 🚨 Emergency Recovery

If you need to recover data:
1. **Stop immediately** - Don't run any more operations
2. **Check backups** - Look for recent database backups
3. **Contact support** - If this was accidental in production
4. **Restore from backup** - Use your backup restoration process

## 📝 Usage Examples

### Basic Cleanup:
```bash
# Simple one-command cleanup
npm run db:clean
```

### API Cleanup:
```bash
# Using curl (if server is running)
curl -X POST http://localhost:3000/api/admin/clean-database \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-key"}'
```

### Check Status:
```bash
# Check current table counts
curl http://localhost:3000/api/admin/clean-database
```

## ✅ Best Practices

1. **Always backup first** - Create a database backup before cleanup
2. **Use development environment** - Never run in production
3. **Verify environment** - Check NODE_ENV is not "production"
4. **Test after cleanup** - Ensure application works correctly
5. **Document changes** - Keep track of when you clean the database

## 🎯 When to Use Database Cleanup

### Good Times:
- ✅ Starting fresh development
- ✅ Testing new features
- ✅ Clearing test data
- ✅ Resetting development environment
- ✅ Before major deployments (in dev)

### Bad Times:
- ❌ In production environment
- ❌ With real user data
- ❌ Without backups
- ❌ When unsure about consequences
- ❌ During active development by others

## 🔧 Troubleshooting

### Script Won't Run:
- Check NODE_ENV is not "production"
- Verify environment variables are set
- Ensure database connection is working
- Check file permissions on scripts

### Partial Cleanup:
- Some tables might not exist (this is normal)
- Check logs for specific error messages
- Verify Supabase credentials are correct
- Try running individual table cleanups

### Permission Errors:
- Ensure SUPABASE_SERVICE_ROLE_KEY is set
- Check RLS policies allow service role access
- Verify database connection string is correct

---

**Remember**: This is a destructive operation. Always backup your data and double-check you're in the right environment before running these scripts!
