'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getParticipantEventById, 
  registerForEvent, 
  getUserProfile,
  checkRegistration 
} from '@/app/actions/participant'
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Users, 
  Accessibility,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = React.useState<any>(null)
  const [profile, setProfile] = React.useState<any>(null)
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Registration Flow State
  const [showNamePrompt, setShowNamePrompt] = React.useState(false)
  const [fullName, setFullName] = React.useState('')
  const [isRegistering, setIsRegistering] = React.useState(false)

  React.useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      const [eventRes, profileRes, regRes] = await Promise.all([
        getParticipantEventById(id as string),
        getUserProfile(),
        checkRegistration(id as string)
      ])

      if (eventRes.success) {
        setEvent(eventRes.data)
      } else {
        setError(eventRes.error || 'Failed to fetch event')
      }

      if (profileRes.success) {
        setProfile(profileRes.data)
        setFullName(profileRes.data.full_name || '')
      }

      if (regRes.success) {
        setIsRegistered(regRes.isRegistered || false)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = () => {
    if (profile?.is_first_time || !profile?.full_name) {
      setShowNamePrompt(true)
    } else {
      handleConfirmRegistration()
    }
  }

  const handleConfirmRegistration = async () => {
    setIsRegistering(true)
    try {
      const result = await registerForEvent(id as string, showNamePrompt ? fullName : undefined)
      if (result.success) {
        setIsRegistered(true)
        setShowNamePrompt(false)
        // Refresh profile
        const updatedProfile = await getUserProfile()
        if (updatedProfile.success) setProfile(updatedProfile.data)
        
        // Show success message
        setTimeout(() => {
          router.push('/participant/registrations')
        }, 1500)
      } else {
        alert(result.error || 'Registration failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E89D71] to-[#D88C61] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] font-medium text-center">Loading event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-100 space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-900">Event Not Found</h2>
          <p className="text-red-700 text-sm">{error || "We couldn't find the event you're looking for."}</p>
          <Button 
            onClick={() => router.push('/participant/events')}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] pb-24">
      {/* Hero Section with Image Placeholder */}
      <div className="relative bg-gradient-to-br from-[#E89D71] to-[#D88C61] h-48 md:h-64">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 left-4">
          <Link href="/participant/events">
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg">
              <ArrowLeft className="w-5 h-5 text-[#2D1E17]" />
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border-2 border-zinc-100 shadow-2xl overflow-hidden">
          {/* Title Section */}
          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D1E17] leading-tight flex-1">
                {event.title}
              </h1>
              {event.is_accessible && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold shrink-0">
                  <Accessibility className="w-3.5 h-3.5" />
                  Accessible
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-[#FEF3EB] rounded-xl">
                <CalendarIcon className="w-5 h-5 text-[#E89D71] shrink-0" />
                <div>
                  <p className="text-xs text-[#6B5A4E] font-medium">Date</p>
                  <p className="text-sm font-bold text-[#2D1E17]">
                    {format(new Date(event.start_time), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#FEF3EB] rounded-xl">
                <Clock className="w-5 h-5 text-[#E89D71] shrink-0" />
                <div>
                  <p className="text-xs text-[#6B5A4E] font-medium">Time</p>
                  <p className="text-sm font-bold text-[#2D1E17]">
                    {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#FEF3EB] rounded-xl">
                <MapPin className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#6B5A4E] font-medium">Venue</p>
                  <p className="text-sm font-semibold text-[#2D1E17] leading-relaxed">
                    {event.location}
                  </p>
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-3 p-3 bg-[#FEF3EB] rounded-xl">
                  <Users className="w-5 h-5 text-[#E89D71] shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B5A4E] font-medium">Capacity</p>
                    <p className="text-sm font-bold text-[#2D1E17]">{event.capacity} participants</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="px-6 pb-6">
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <h3 className="font-bold text-[#2D1E17] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E89D71]" />
                  About This Event
                </h3>
                <p className="text-[#6B5A4E] leading-relaxed whitespace-pre-wrap text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Registration Section */}
          <div className="px-6 pb-6">
            {isRegistered ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 text-center space-y-3">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">You're Registered!</h3>
                <p className="text-sm text-green-700">
                  We'll see you at the event. Check your registrations for the QR code.
                </p>
                <Link href="/participant/registrations">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold mt-2 shadow-lg">
                    View My Registrations
                  </Button>
                </Link>
              </div>
            ) : (
              <Button 
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className="w-full bg-[#E89D71] hover:bg-[#D88C61] text-white rounded-2xl font-bold h-14 text-lg shadow-xl shadow-[#E89D71]/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isRegistering ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Register for This Event
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4">
          <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 p-3 rounded-xl text-white shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-blue-900">Event Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1 leading-relaxed">
                  <li>• Registration is free for all eligible participants</li>
                  <li>• Please arrive 10 minutes early</li>
                  <li>• Cancel at least 24 hours in advance if unable to attend</li>
                  <li>• Bring your QR code for check-in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowNamePrompt(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E89D71] to-[#D88C61] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D1E17]">Welcome!</h3>
              <p className="text-[#6B5A4E]">
                Since it's your first time, please let us know your full name for our records.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#2D1E17]">Full Name</label>
              <Input 
                placeholder="Enter your full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-xl border-2 text-base focus:border-[#E89D71] focus:ring-[#E89D71]"
                autoFocus
              />
              <p className="text-xs text-[#6B5A4E]">This will be used for attendance and records</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                disabled={!fullName.trim() || isRegistering}
                onClick={handleConfirmRegistration}
                className="w-full bg-[#E89D71] hover:bg-[#D88C61] text-white rounded-xl h-14 font-bold text-base shadow-xl shadow-[#E89D71]/30"
              >
                {isRegistering ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Complete Registration'
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setShowNamePrompt(false)}
                className="w-full rounded-xl h-12 font-semibold text-[#6B5A4E]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
