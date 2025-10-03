# Clerk User Cleanup Instructions

⚠️ **WARNING: This will permanently delete all user accounts and cannot be undone!**

## Method 1: Clerk Dashboard (Recommended)

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com/
   - Sign in to your account

2. **Select Your Application**
   - Choose the application you want to clean

3. **Navigate to Users**
   - Click "Users" in the left sidebar

4. **Delete All Users**
   - Select all users (use checkbox at top to select all)
   - Click "Delete" button
   - Confirm the deletion

## Method 2: Clerk API (Advanced)

If you have many users, you can use the Clerk API:

### Prerequisites
- Your Clerk Secret Key from the dashboard
- API access enabled

### Get All Users
```bash
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY"
```

### Delete Individual User
```bash
curl -X DELETE "https://api.clerk.com/v1/users/{user_id}" \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY"
```

### Bulk Delete Script (Node.js)
```javascript
const CLERK_SECRET_KEY = 'your_clerk_secret_key_here';

async function deleteAllClerkUsers() {
  // Get all users
  const response = await fetch('https://api.clerk.com/v1/users', {
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`
    }
  });
  
  const users = await response.json();
  
  // Delete each user
  for (const user of users) {
    await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`
      }
    });
    console.log(`Deleted user: ${user.id}`);
  }
}
```

## Method 3: Reset Clerk Application

If you want to completely start fresh:

1. **Create New Clerk Application**
   - Go to Clerk Dashboard
   - Create a new application
   - Update your `.env.local` with new keys

2. **Delete Old Application**
   - Go to old application settings
   - Delete the application entirely

## Verification

After cleanup, verify:
- ✅ Clerk Dashboard shows 0 users
- ✅ Your app shows no authenticated users
- ✅ All user sessions are invalidated

## Important Notes

- **Irreversible**: Deleted users cannot be recovered
- **Sessions**: All user sessions will be invalidated
- **Webhooks**: May trigger user deletion webhooks
- **Billing**: Check if you have any active subscriptions to cancel

## Environment Variables to Update

After cleanup, you may want to update:
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_new_key
CLERK_SECRET_KEY=your_new_secret_key
```
