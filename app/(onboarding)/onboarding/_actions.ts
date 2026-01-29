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
  // Participant -> Caregiver linking
  caregiverName?: string;
  caregiverEmail?: string;
  emergencyContact?: string;
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
    
    // Prepare profile data
    const profileData: any = {
      id: userId,
      email: userEmail,
      full_name: fullName || null,
      role: formData.role,
      membership_type: formData.membershipType || null,
      updated_at: new Date().toISOString(),
    }

    // If participant with caregiver info, add emergency contact
    if (formData.role === 'participant' && formData.caregiverEmail) {
      profileData.emergency_contact = formData.emergencyContact || formData.caregiverEmail
      profileData.caregiver_name = formData.caregiverName
      profileData.caregiver_email = formData.caregiverEmail
    }

    const { error: supabaseError } = await supabase
      .from('profiles')
      .upsert(profileData)

    if (supabaseError) {
      console.error('Supabase Sync Error:', supabaseError.message)
    } else {
      console.log('Supabase Profile Synced Successfully')
    }

    // 3. Try to link with caregiver if email provided
    if (formData.role === 'participant' && formData.caregiverEmail) {
      console.log('Attempting to link with caregiver:', formData.caregiverEmail)
      
      // Find caregiver by email
      const { data: caregiverProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', formData.caregiverEmail)
        .eq('role', 'caregiver')
        .single()

      if (caregiverProfile) {
        console.log('Found caregiver, creating link:', caregiverProfile.id)
        
        // Create the caregiver-participant link
        const { error: linkError } = await supabase
          .from('caregiver_participants')
          .insert({
            caregiver_id: caregiverProfile.id,
            participant_id: userId,
            relationship: 'other', // Default relationship
          })

        if (linkError) {
          console.error('Error linking to caregiver:', linkError)
        } else {
          console.log('Successfully linked with caregiver!')
        }
      } else {
        console.log('Caregiver not found, saved as emergency contact only')
      }
    }

    revalidatePath('/', 'layout')
    console.log('Path revalidated. Returning success.')
    return { success: true }
  } catch (error) {
    console.error('Onboarding error:', error)
    return { error: 'Failed to complete onboarding' }
  }
}
