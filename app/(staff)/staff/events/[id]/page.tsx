'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEventById } from '../_actions'
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  Accessibility,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      const result = await getEventById(id as string)
      if (result.success) {
        setEvent(result.data)
      } else {
        setError(result.error || 'Failed to fetch event details')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#E89D71]" />
        <p className="text-zinc-500 font-medium">Loading event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-900">Oops! Something went wrong</h2>
          <p className="text-red-700">{error || "We couldn't find the event you're looking for."}</p>
          <Button 
            onClick={() => router.push('/staff/events')}
            variant="outline" 
            className="rounded-xl border-red-200 text-red-700 hover:bg-red-100"
          >
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4 animate-in fade-in duration-500">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/staff/events">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ArrowLeft className="w-5 h-5 text-[#6B5A4E]" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#2D1E17] leading-tight">{event.title}</h1>
          <p className="text-[#6B5A4E]">Organization Event Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
              <CardTitle className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E89D71]" />
                Event Description
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 px-6">
              <p className="text-[#4A3728] leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-zinc-100 shadow-sm p-6 bg-white flex items-center gap-4">
              <div className="bg-[#FEF3EB] p-3 rounded-xl text-[#E89D71]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Capacity</p>
                <p className="text-xl font-bold text-[#2D1E17]">{event.capacity || 20} Seats</p>
              </div>
            </Card>
            <Card className="rounded-2xl border-zinc-100 shadow-sm p-6 bg-white flex items-center gap-4">
              <div className="bg-[#E8F3F0] p-3 rounded-xl text-[#86B1A4]">
                <Accessibility className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Accessibility</p>
                <p className="text-xl font-bold text-[#2D1E17]">
                  {event.is_accessible ? "Fully Accessible" : "Standard Entry"}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Sidebar (Right) */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-zinc-100 shadow-sm p-6 bg-white space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D1E17]">Date</p>
                  <p className="text-sm text-[#6B5A4E]">{format(new Date(event.start_time), 'EEEE, dd MMMM yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D1E17]">Time</p>
                  <p className="text-sm text-[#6B5A4E]">
                    {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D1E17]">Venue</p>
                  <p className="text-sm text-[#6B5A4E] leading-relaxed">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-50 space-y-3">
              <Button className="w-full bg-[#E89D71] hover:bg-[#D88C61] text-white rounded-xl font-bold h-11">
                Edit Event
              </Button>
              <Button variant="outline" className="w-full rounded-xl font-bold h-11 text-red-500 border-red-50 hover:bg-red-50 hover:text-red-600">
                Cancel Event
              </Button>
            </div>
          </Card>

          {/* Quick Actions / QR Placeholder */}
          <Card className="rounded-3xl border-dashed border-2 border-zinc-100 p-8 bg-zinc-50/50 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm mx-auto w-fit mb-4 border border-zinc-100">
              <Users className="h-12 w-12 text-zinc-200" />
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Check-in Stats</p>
            <p className="text-sm text-zinc-500 italic">Attendee management and QR scanning coming soon.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
