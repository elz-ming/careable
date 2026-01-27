/**
 * Utility to sync user role from Supabase to Clerk
 * Run this if a user's role exists in Supabase but not in Clerk metadata
 */

import { clerkClient } from '@clerk/nextjs/server';

export async function syncRoleToClerk(userId: string, role: string) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });
    console.log(`✅ Synced role "${role}" to Clerk for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to sync role to Clerk:', error);
    return { success: false, error };
  }
}
