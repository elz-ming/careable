'use client'

import * as React from 'react'
import { getUserRegistrations } from '@/app/actions/participant'
import { useAuth } from '@clerk/nextjs'
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  Ticket,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Heart,
  Sparkles
} from 'lucide-react'
import { format, isPast, isFuture } from 'date-fns'
import AttendanceQR from '@/src/components/AttendanceQR'

export default function VolunteerRegistrationsPage() {
  const { userId } = useAuth()
  const [registrations, setRegistrations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<'all' | 'upcoming' | 'past'>('upcoming')

  React.useEffect(() => {
    if (userId) {
      fetchRegistrations()
    }
  }, [userId])

  const fetchRegistrations = async () => {
    try {
      const result = await getUserRegistrations()
      if (result.success) {
        setRegistrations(result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    const eventDate = new Date(reg.events.start_time)
    if (filter === 'upcoming') return isFuture(eventDate)
    if (filter === 'past') return isPast(eventDate)
    return true
  })

  const upcomingCount = registrations.filter(r => isFuture(new Date(r.events.start_time))).length
  const pastCount = registrations.filter(r => isPast(new Date(r.events.start_time))).length

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] font-medium text-center">Loading your volunteer commitments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#E8F3F0] to-[#E8F3F0] px-4 pt-6 pb-8 border-b border-[#86B1A4]/10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-[#86B1A4]">
            <Ticket className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Commitments</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D1E17] leading-tight">
            Your Volunteer Schedule
          </h1>
          <p className="text-[#6B5A4E] text-sm md:text-base max-w-xl">
            Thank you for giving your time to support our community
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === 'upcoming'
                  ? 'bg-[#86B1A4] text-white shadow-lg shadow-[#86B1A4]/30'
                  : 'bg-white text-[#6B5A4E] hover:bg-zinc-50'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === 'past'
                  ? 'bg-[#86B1A4] text-white shadow-lg shadow-[#86B1A4]/30'
                  : 'bg-white text-[#6B5A4E] hover:bg-zinc-50'
              }`}
            >
              Completed ({pastCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === 'all'
                  ? 'bg-[#86B1A4] text-white shadow-lg shadow-[#86B1A4]/30'
                  : 'bg-white text-[#6B5A4E] hover:bg-zinc-50'
              }`}
            >
              All ({registrations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {filteredRegistrations.length > 0 ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {filteredRegistrations.map((reg) => {
              const isPastEvent = isPast(new Date(reg.events.start_time))
              const isAttended = reg.status === 'attended'

              return (
                <div 
                  key={reg.id} 
                  className={`bg-white rounded-3xl border-2 ${
                    isPastEvent ? 'border-zinc-100 opacity-75' : 'border-zinc-100 hover:border-[#86B1A4]'
                  } shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  <div className="p-5 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isAttended
                          ? 'bg-green-100 text-green-700'
                          : isPastEvent
                          ? 'bg-zinc-100 text-zinc-500'
                          : 'bg-[#E8F3F0] text-[#86B1A4]'
                      }`}>
                        {isAttended ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </>
                        ) : isPastEvent ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Missed
                          </>
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5" />
                            Confirmed
                          </>
                        )}
                      </span>

                      {reg.check_in_at && (
                        <span className="text-xs text-green-600 font-medium">
                          Checked in {format(new Date(reg.check_in_at), 'dd MMM, HH:mm')}
                        </span>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-[#2D1E17] leading-tight">
                        {reg.events.title}
                      </h3>

                      <div className="grid gap-2 text-sm text-[#6B5A4E]">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-4 h-4 text-[#86B1A4] shrink-0" />
                          <span className="font-medium">
                            {format(new Date(reg.events.start_time), 'EEEE, dd MMMM yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-[#86B1A4] shrink-0" />
                          <span>
                            {format(new Date(reg.events.start_time), 'HH:mm')} - {format(new Date(reg.events.end_time), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-[#86B1A4] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{reg.events.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isPastEvent && !isAttended && (
                      <div className="pt-4 border-t border-zinc-100">
                        <AttendanceQR 
                          registrationId={reg.id} 
                          eventTitle={reg.events.title} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gradient-to-br from-[#E8F3F0] to-[#E8F3F0]/50 p-12 rounded-3xl mb-6">
              <Ticket className="h-16 w-16 text-[#86B1A4]/40 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D1E17] mb-3">
              {filter === 'upcoming' && 'No upcoming commitments'}
              {filter === 'past' && 'No past volunteer work'}
              {filter === 'all' && 'No volunteer commitments yet'}
            </h3>
            <p className="text-[#6B5A4E] max-w-sm mb-8">
              {filter === 'upcoming' && "You haven't signed up for any volunteer opportunities yet. Browse available events to get started!"}
              {filter === 'past' && "Your volunteer history will appear here once you complete your first event."}
              {filter === 'all' && "Start making a difference by discovering volunteer opportunities that match your interests."}
            </p>
            <a 
              href="/volunteer/opportunities"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#86B1A4] text-white rounded-xl font-bold hover:bg-[#6FA08F] transition-colors shadow-lg shadow-[#86B1A4]/30"
            >
              <Sparkles className="w-5 h-5" />
              Discover Opportunities
            </a>
          </div>
        )}

        {/* Info Card */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-6 bg-[#E8F3F0] border-2 border-[#86B1A4]/20 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#86B1A4] p-3 rounded-xl text-white shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-[#2D1E17]">Volunteer Guidelines</h4>
                <p className="text-sm text-[#6B5A4E] leading-relaxed">
                  Show your QR code to staff when you arrive. Please arrive 15 minutes early to help with setup. 
                  Thank you for your dedication to our community!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}