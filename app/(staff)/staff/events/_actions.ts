'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { extractCalendarEvents, type CalendarExtraction } from '../lib/calendarExtractor'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function uploadAndExtractCalendar(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const file = formData.get('calendar') as File
  if (!file) throw new Error('No file uploaded')

  const buffer = Buffer.from(await file.arrayBuffer())
  
  console.log(`[Calendar Extraction] Processing file: ${file.name} (${file.type}) using model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}`)
  
  try {
    const extraction = await extractCalendarEvents({
      buffer,
      filename: file.name,
      mimeType: file.type,
    })

    if (!extraction || !extraction.events) {
      console.warn(`[Calendar Extraction] Extraction successful but returned no events for ${file.name}`)
    }

    return { success: true, data: extraction }
  } catch (error: any) {
    console.error('Extraction Error:', error)
    return { success: false, error: error.message }
  }
}

export async function syncEventsToSupabase(events: any[]) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const correlationId = Math.random().toString(36).substring(2, 10).toUpperCase();
  console.log(`[${correlationId}] [ACTION] Syncing ${events.length} events to Supabase for user ${userId}`);

  const supabase = await createClient()

  // Map extracted events to the Supabase Event schema
  const formattedEvents = events.map(event => ({
    created_by: userId,
    title: event.title,
    description: event.description || `Extracted from ${event.sourceFile || 'unknown'}`,
    location: event.location || 'TBD',
    start_time: `${event.date_iso}T${event.start_time || '00:00'}:00Z`,
    end_time: `${event.date_iso}T${event.end_time || '23:59'}:00Z`,
    capacity: 20, // Default capacity
    is_accessible: event.is_accessible ?? true,
  }))

  const { data, error } = await supabase
    .from('events')
    .upsert(formattedEvents, { onConflict: 'title,start_time' }) // Basic deduplication

  if (error) {
    console.error(`[${correlationId}] [ACTION ERROR] Supabase Sync Error:`, error.message);
    return { success: false, error: error.message }
  }

  console.log(`[${correlationId}] [ACTION] Successfully synced ${events.length} events.`);
  revalidatePath('/staff/events')
  return { success: true }
}

export async function getEvents() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[ACTION ERROR] Failed to fetch events:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getEventById(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[ACTION ERROR] Failed to fetch event:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateEvent(id: string, updates: any) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .update({
      title: updates.title,
      description: updates.description,
      location: updates.location,
      start_time: updates.start_time,
      end_time: updates.end_time,
      capacity: updates.capacity,
      is_accessible: updates.is_accessible,
      status: updates.status
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[ACTION ERROR] Failed to update event:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath(`/staff/events/${id}`)
  revalidatePath('/staff/events')
  return { success: true, data }
}

export async function cancelEvent(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    console.error('[ACTION ERROR] Failed to cancel event:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath(`/staff/events/${id}`)
  revalidatePath('/staff/events')
  return { success: true }
}
