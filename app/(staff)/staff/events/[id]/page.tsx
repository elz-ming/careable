'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEventById, updateEvent, cancelEvent } from '../_actions'
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
  AlertCircle,
  XCircle,
  Save,
  Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Edit State
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [editForm, setEditForm] = React.useState<any>(null)

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
        setEditForm({
          title: result.data.title || '',
          description: result.data.description || '',
          location: result.data.location || '',
          start_time: result.data.start_time?.split('.')[0] || '', // Format for datetime-local
          end_time: result.data.end_time?.split('.')[0] || '',
          capacity: result.data.capacity || 20,
          is_accessible: result.data.is_accessible ?? true,
          status: result.data.status || 'active'
        })
      } else {
        setError(result.error || 'Failed to fetch event details')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateEvent(id as string, editForm)
      if (result.success) {
        setEvent(result.data)
        setIsEditing(false)
      } else {
        alert(result.error || 'Failed to update event')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) return
    
    setIsSaving(true)
    try {
      const result = await cancelEvent(id as string)
      if (result.success) {
        setEvent({ ...event, status: 'cancelled' })
        alert('Event cancelled successfully')
      } else {
        alert(result.error || 'Failed to cancel event')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSaving(false)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/staff/events">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
              <ArrowLeft className="w-5 h-5 text-[#6B5A4E]" />
            </Button>
          </Link>
          <div>
            {isEditing ? (
              <Input 
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-2xl font-bold h-12 bg-white rounded-xl border-zinc-200"
              />
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#2D1E17] leading-tight">{event.title}</h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  event.status === 'active' ? "bg-green-100 text-green-700" :
                  event.status === 'cancelled' ? "bg-red-100 text-red-700" :
                  "bg-zinc-100 text-zinc-700"
                )}>
                  {event.status}
                </span>
              </div>
            )}
            <p className="text-[#6B5A4E]">Organization Event Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="rounded-xl font-bold h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#E89D71] hover:bg-[#D88C61] text-white rounded-xl font-bold h-11"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : event.status !== 'cancelled' && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-[#FEF3EB] hover:bg-[#FDE6D8] text-[#E89D71] rounded-xl font-bold h-11 border-none"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </Button>
          )}
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
              {isEditing ? (
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E89D71]/20 text-[#4A3728]"
                  placeholder="Describe the event..."
                />
              ) : (
                <p className="text-[#4A3728] leading-relaxed whitespace-pre-wrap">
                  {event.description || "No description provided for this event."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-zinc-100 shadow-sm p-6 bg-white flex items-center gap-4">
              <div className="bg-[#FEF3EB] p-3 rounded-xl text-[#E89D71]">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Capacity</p>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={editForm.capacity ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm({ ...editForm, capacity: val === '' ? '' : parseInt(val) })
                    }}
                    className="mt-1 h-8 rounded-lg"
                  />
                ) : (
                  <p className="text-xl font-bold text-[#2D1E17]">{event.capacity || 20} Seats</p>
                )}
              </div>
            </Card>
            <Card 
              className={cn(
                "rounded-2xl border-zinc-100 shadow-sm p-6 flex items-center gap-4 cursor-pointer transition-colors",
                isEditing && editForm.is_accessible ? "bg-[#E8F3F0]" : "bg-white"
              )}
              onClick={() => isEditing && setEditForm({ ...editForm, is_accessible: !editForm.is_accessible })}
            >
              <div className={cn(
                "p-3 rounded-xl",
                (isEditing ? editForm.is_accessible : event.is_accessible) ? "bg-[#E8F3F0] text-[#86B1A4]" : "bg-zinc-100 text-zinc-400"
              )}>
                <Accessibility className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Accessibility</p>
                <p className="text-xl font-bold text-[#2D1E17]">
                  {(isEditing ? editForm.is_accessible : event.is_accessible) ? "Fully Accessible" : "Standard Entry"}
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
                <div className="flex-1">
                  <p className="font-bold text-[#2D1E17]">Date & Time</p>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-400">Start</label>
                        <Input 
                          type="datetime-local"
                          value={editForm.start_time}
                          onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-400">End</label>
                        <Input 
                          type="datetime-local"
                          value={editForm.end_time}
                          onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-[#6B5A4E]">{format(new Date(event.start_time), 'EEEE, dd MMMM yyyy')}</p>
                      <p className="text-sm text-[#6B5A4E] mt-1 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-zinc-50 pt-4">
                <MapPin className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[#2D1E17]">Venue</p>
                  {isEditing ? (
                    <Input 
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-sm text-[#6B5A4E] leading-relaxed">{event.location}</p>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && event.status === 'active' && (
              <div className="pt-6 border-t border-zinc-50 space-y-3">
                <Button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outline" 
                  className="w-full rounded-xl font-bold h-11 text-red-500 border-red-50 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Cancel Event
                </Button>
              </div>
            )}
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
