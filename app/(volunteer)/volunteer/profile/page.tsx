'use client'

import * as React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { getUserProfile, getUserRegistrations } from '@/app/actions/participant'
import { isFuture } from 'date-fns'
import { 
  User,
  Mail,
  Calendar,
  Globe,
  Shield,
  Award,
  Loader2,
  ChevronRight,
  Check,
  Heart
} from 'lucide-react'

export default function VolunteerProfilePage() {
  const { user } = useUser()
  const { userId } = useAuth()
  const [profile, setProfile] = React.useState<any>(null)
  const [registrations, setRegistrations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedLanguage, setSelectedLanguage] = React.useState('en')

  React.useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const [profileResult, regsResult] = await Promise.all([
        getUserProfile(),
        getUserRegistrations()
      ])
      
      if (profileResult.success) {
        setProfile(profileResult.data)
        setSelectedLanguage(profileResult.data.language_preference || 'en')
      }
      
      if (regsResult.success) {
        setRegistrations(regsResult.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang)
    // TODO: Implement language update in database
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
  ]

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] font-medium text-center">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#E8F3F0] to-[#E8F3F0] px-4 pt-6 pb-12 border-b border-[#86B1A4]/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-[#86B1A4]">
            <User className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border-2 border-zinc-100 p-6 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {user?.firstName?.[0] || profile?.full_name?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#2D1E17]">
                  {profile?.full_name || user?.fullName || 'Volunteer'}
                </h1>
                <p className="text-[#6B5A4E] text-sm mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#E8F3F0] text-[#86B1A4] rounded-full text-xs font-bold capitalize flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Volunteer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.filter(r => r.status === 'attended').length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">Events Helped</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.filter(r => isFuture(new Date(r.events.start_time))).length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">Upcoming</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Language Selection */}
        <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#86B1A4]/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#86B1A4]" />
              </div>
              <div>
                <h2 className="font-bold text-[#2D1E17]">Language / 语言 / Bahasa</h2>
                <p className="text-xs text-[#6B5A4E]">Choose your preferred language</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-[#86B1A4] text-white shadow-lg shadow-[#86B1A4]/20'
                    : 'bg-zinc-50 text-[#6B5A4E] hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={`font-bold ${selectedLanguage === lang.code ? 'text-white' : 'text-[#2D1E17]'}`}>
                      {lang.name}
                    </p>
                    <p className={`text-sm ${selectedLanguage === lang.code ? 'text-white/80' : 'text-[#6B5A4E]'}`}>
                      {lang.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-6 h-6 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#2D1E17]">Account Information</h2>
                <p className="text-xs text-[#6B5A4E]">Your Careable volunteer account</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
              <Mail className="w-5 h-5 text-[#6B5A4E]" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] font-medium">Email Address</p>
                <p className="text-sm text-[#2D1E17] font-semibold">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
              <Calendar className="w-5 h-5 text-[#6B5A4E]" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] font-medium">Volunteering Since</p>
                <p className="text-sm text-[#2D1E17] font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#86B1A4] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#86B1A4] transition-colors">
              Edit Personal Information
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#86B1A4] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#86B1A4] transition-colors">
              Volunteer Preferences
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#86B1A4] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#86B1A4] transition-colors">
              Notification Settings
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Thank You Card */}
        <div className="bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] rounded-3xl p-8 text-center text-white shadow-xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl mb-2">Thank You for Volunteering!</h3>
          <p className="text-white/90 text-sm">
            Your dedication helps create meaningful experiences for children and families in our community.
          </p>
        </div>
      </div>
    </div>
  )
}