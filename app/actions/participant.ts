'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

/**
 * Get events for authenticated users (uses RLS with user context)
 */
export async function getParticipantEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Get public events for unauthenticated visitors
 * Uses public anon key without authentication
 * Shows active events (both upcoming and recent past events for demo purposes)
 */
export async function getPublicEvents() {
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  console.log('[getPublicEvents] Fetching active events for landing page')
  
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, location, start_time, end_time, capacity, status, target_audience')
    .eq('status', 'active')
    .order('start_time', { ascending: false }) // Show most recent first
    .limit(50)

  console.log('[getPublicEvents] Query result - Count:', data?.length, 'Error:', error)
  
  if (error) {
    console.error('Error fetching public events:', error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function getParticipantEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function registerForEvent(eventId: string, fullName?: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  // 1. If fullName is provided, it means we are updating the profile (first time)
  if (fullName) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName,
        is_first_time: false 
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false, error: 'Failed to update your profile name.' }
    }
  }

  // 2. Generate a unique ticket code (for QR scanning later)
  const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`

  // 3. Create the registration
  const { error: regError } = await supabase
    .from('registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_code: ticketCode,
      status: 'registered'
    })

  if (regError) {
    if (regError.code === '23505') { // Unique constraint violation
      return { success: false, error: 'You are already registered for this event.' }
    }
    console.error('Error creating registration:', regError)
    return { success: false, error: regError.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/events')
  revalidatePath(`/events/${eventId}`)
  
  return { success: true }
}

export async function getUserProfile() {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function checkRegistration(eventId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false, isRegistered: false }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { success: true, isRegistered: false }
  }

  return { success: true, isRegistered: true }
}

export async function getUserRegistrations() {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized', data: [] }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      check_in_at,
      events (
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        capacity,
        is_accessible
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registrations:', error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}
