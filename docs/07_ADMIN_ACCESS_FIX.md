# 🔧 Admin Access Fix

## Problem
Your user account has `role: "admin"` in the Supabase database, but Clerk's session metadata doesn't have this role set, causing "Forbidden: Staff or Admin access required" errors.

## Solution Applied

### 1. Updated `lib/analytics/queries.ts`
The `requireStaffOrAdmin()` function now:
- ✅ First checks Clerk session claims for role
- ✅ Falls back to checking Supabase database if not found in Clerk
- ✅ Logs access attempts for debugging

This ensures that even if Clerk metadata is missing, the role from Supabase will be used.

### 2. Created One-Time Sync API
**Endpoint:** `GET /api/admin/sync-role`

This API will:
- Read your role from Supabase
- Update your Clerk `publicMetadata.role` to match
- Return confirmation

## How to Fix Your Account

### Option A: Use the Sync API (Recommended)
1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit this URL while logged in:**
   ```
   http://localhost:3000/api/admin/sync-role
   ```

3. **You should see:**
   ```json
   {
     "success": true,
     "message": "Role synced successfully! Please refresh the page.",
     "data": {
       "userId": "user_xxxxx",
       "email": "elz.zhenming@gmail.com",
       "name": "Lin Zhenming",
       "role": "admin",
       "syncedToClerk": true
     }
   }
   ```

4. **Refresh the admin dashboard** - it should now work!

### Option B: Manually Update Clerk (Alternative)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Find your user
3. Go to **Metadata** tab
4. Update **Public metadata**:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save and sign out/in again

## Why This Happened

The Clerk webhook (`app/api/webhooks/clerk/route.ts`) is supposed to sync roles from Clerk to Supabase on user creation/update. However, if you:
- Created the user directly in Supabase, OR
- Updated the role in Supabase manually

Then Clerk's metadata was never updated. This fix ensures the system works both ways.

## Prevention

For future users:
1. **Always set role in Clerk first** when creating admin/staff users
2. The webhook will automatically sync to Supabase
3. Or use the sync API after manually updating Supabase

## Files Modified
- ✅ `lib/analytics/queries.ts` - Fallback to database check
- ✅ `app/api/admin/sync-role/route.ts` - New sync endpoint (created)
- ✅ `lib/clerk/syncRole.ts` - Utility function (created)

## Build Status
✅ **Build passing** - All routes compiled successfully
