'use client'

import * as React from 'react'
import { getParticipantEvents } from '@/app/actions/participant'
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Search, 
  ChevronRight,
  Loader2,
  Accessibility,
  Users,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const result = await getParticipantEvents()
      if (result.success) {
        setEvents(result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getEventBadge = (startTime: string) => {
    const date = new Date(startTime)
    if (isToday(date)) return { text: 'Today', color: 'bg-red-100 text-red-700' }
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'bg-blue-100 text-blue-700' }
    if (isThisWeek(date)) return { text: 'This Week', color: 'bg-green-100 text-green-700' }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E89D71] to-[#D88C61] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] dark:text-zinc-300 font-medium text-center">Discovering amazing events for you...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#FEF3EB] to-[#FEF3EB] dark:from-zinc-900 dark:via-zinc-900/50 dark:to-zinc-900/30 px-4 pt-6 pb-8 border-b border-[#E89D71]/10 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-[#E89D71]">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Discover Events</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D1E17] dark:text-white leading-tight">
            Find Your Next<br/>Adventure
          </h1>
          <p className="text-[#6B5A4E] dark:text-zinc-300 text-sm md:text-base max-w-xl">
            Join engaging activities and connect with our community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B5A4E]/50 dark:text-zinc-400" />
            <Input 
              placeholder="Search events or locations..." 
              className="pl-12 h-14 bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700 rounded-2xl border-2 border-zinc-100 shadow-sm focus:border-[#E89D71] focus:ring-[#E89D71] text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2 text-sm">
            <div className="flex items-center gap-2 text-[#6B5A4E] dark:text-zinc-300">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-semibold">{events.length} Events</span>
            </div>
            <div className="flex items-center gap-2 text-[#E89D71]">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
            {filteredEvents.map((event) => {
              const badge = getEventBadge(event.start_time)
              
              return (
                <Link key={event.id} href={`/participant/events/${event.id}`}>
                  <div className="group h-full bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#E89D71] hover:shadow-2xl hover:shadow-[#E89D71]/10 dark:hover:shadow-[#E89D71]/20 dark:hover:border-[#E89D71]/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col">
                    {/* Card Header with Badge */}
                    <div className="p-5 pb-4 space-y-3">
                      {badge && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-[#2D1E17] dark:text-white leading-tight group-hover:text-[#E89D71] transition-colors line-clamp-2 min-h-[3.5rem]">
                        {event.title}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="px-5 pb-5 space-y-3 flex-1 flex flex-col">
                      {/* Date & Time */}
                      <div className="space-y-2 text-sm text-[#6B5A4E] dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#E89D71] shrink-0" />
                          <span className="font-medium">{format(new Date(event.start_time), 'EEE, dd MMM yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#E89D71] shrink-0" />
                          <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm text-[#6B5A4E] dark:text-zinc-300">
                        <MapPin className="w-4 h-4 text-[#E89D71] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{event.location}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.capacity && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs text-[#6B5A4E] dark:text-zinc-300">
                            <Users className="w-3 h-3" />
                            <span>{event.capacity} seats</span>
                          </div>
                        )}
                        {event.is_accessible && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400">
                            <Accessibility className="w-3 h-3" />
                            <span>Accessible</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[#E89D71] font-bold text-sm">
                        <span>View Details</span>
                        <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 p-8 rounded-full mb-6">
              <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-[#2D1E17] dark:text-white mb-2">No events found</h3>
            <p className="text-[#6B5A4E] dark:text-zinc-300 max-w-sm">
              {searchQuery 
                ? "Try adjusting your search terms or browse all available events." 
                : "Check back soon for new exciting activities!"}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-3 bg-[#E89D71] text-white rounded-xl font-semibold hover:bg-[#D88C61] transition-colors shadow-lg shadow-[#E89D71]/20"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
