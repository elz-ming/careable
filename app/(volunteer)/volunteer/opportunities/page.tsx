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
  Accessibility
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function OpportunitiesPage() {
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#E89D71]" />
        <p className="text-zinc-500 font-medium">Loading opportunities...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4">
      <div>
        <h1 className="text-3xl font-bold text-[#2D1E17]">Volunteer Opportunities</h1>
        <p className="text-[#6B5A4E]">Help out at our upcoming events and make a difference.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Search opportunities..." 
          className="pl-10 h-11 bg-white rounded-xl border-zinc-100 shadow-sm focus:ring-[#E89D71]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/volunteer/opportunities/${event.id}`}>
              <Card className="group h-full overflow-hidden rounded-3xl border-zinc-100 hover:border-[#E89D71]/30 hover:shadow-xl hover:shadow-[#E89D71]/5 transition-all duration-300 bg-white cursor-pointer flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-[#2D1E17] leading-tight group-hover:text-[#E89D71] transition-colors">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-[#6B5A4E]">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {format(new Date(event.start_time), 'EEE, dd MMM yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-sm text-[#6B5A4E]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{format(new Date(event.start_time), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{event.location}</span>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-[#E89D71] font-bold text-sm">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
          <div className="bg-zinc-50 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-lg font-medium">No opportunities found</p>
          <p className="text-sm">Check back soon for more events!</p>
        </div>
      )}
    </div>
  )
}
