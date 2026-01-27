import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ONE-TIME FIX: Sync role from Supabase to Clerk
 * GET /api/admin/sync-role
 * 
 * This will update your Clerk publicMetadata.role to match your Supabase profiles.role
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get role from Supabase
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ 
        error: 'User not found in database',
        details: error 
      }, { status: 404 });
    }

    // Update Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: profile.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Role synced successfully! Please refresh the page.',
      data: {
        userId,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        syncedToClerk: true
      }
    });

  } catch (error: any) {
    console.error('[Sync Role Error]:', error);
    return NextResponse.json({ 
      error: 'Failed to sync role',
      details: error.message 
    }, { status: 500 });
  }
}
