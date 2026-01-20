'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { updateUserRole } from '@/lib/clerk/roles'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/supabase/model'

export async function completeOnboarding(formData: {
  role: UserRole;
  membershipType?: string;
  email?: string; // For staff prototype
}) {
  const { userId } = await auth()
  const client = await clerkClient()

  console.log('--- [DEBUG: completeOnboarding] ---')
  console.log('User ID:', userId)
  console.log('Requested Role:', formData.role)

  if (!userId) {
    console.error('Error: No user ID found')
    return { error: 'No user ID found' }
  }

  try {
    const user = await client.users.getUser(userId)
    const userEmail = user.emailAddresses[0]?.emailAddress
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()

    console.log('User Email:', userEmail)

    if (!userEmail) {
      console.error('Error: User email not found')
      return { error: 'User email not found' }
    }

    // 1. Update Clerk publicMetadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: formData.role,
      },
    })
    console.log('Clerk Metadata Updated Successfully')

    // 2. Sync with Supabase profiles table
    const supabase = await createClient()
    const { error: supabaseError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: fullName || null,
        role: formData.role,
        membership_type: formData.membershipType || null,
        updated_at: new Date().toISOString(),
      })

    if (supabaseError) {
      console.error('Supabase Sync Error:', supabaseError.message)
    } else {
      console.log('Supabase Profile Synced Successfully')
    }

    revalidatePath('/', 'layout')
    console.log('Path revalidated. Returning success.')
    return { success: true }
  } catch (error) {
    console.error('Onboarding error:', error)
    return { error: 'Failed to complete onboarding' }
  }
}
