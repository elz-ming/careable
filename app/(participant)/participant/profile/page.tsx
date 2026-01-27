'use client'

import * as React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { getUserProfile } from '@/app/actions/participant'
import { 
  User,
  Mail,
  Calendar,
  Globe,
  Shield,
  Heart,
  Loader2,
  ChevronRight,
  Check
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useUser()
  const { userId } = useAuth()
  const [profile, setProfile] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedLanguage, setSelectedLanguage] = React.useState('en')

  React.useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const result = await getUserProfile()
      if (result.success) {
        setProfile(result.data)
        setSelectedLanguage(result.data.language_preference || 'en')
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
    // For now, just update local state
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E89D71] to-[#D88C61] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] font-medium text-center">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#FEF3EB] to-[#FEF3EB] px-4 pt-6 pb-12 border-b border-[#E89D71]/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-[#E89D71]">
            <User className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border-2 border-zinc-100 p-6 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E89D71] to-[#D88C61] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {user?.firstName?.[0] || profile?.full_name?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#2D1E17]">
                  {profile?.full_name || user?.fullName || 'Guest User'}
                </h1>
                <p className="text-[#6B5A4E] text-sm mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#FEF3EB] text-[#E89D71] rounded-full text-xs font-bold capitalize">
                    {profile?.role || 'Participant'}
                  </span>
                  {profile?.membership_type && (
                    <span className="px-3 py-1 bg-zinc-100 text-[#6B5A4E] rounded-full text-xs font-medium">
                      {profile.membership_type}
                    </span>
                  )}
                </div>
              </div>
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
              <div className="w-10 h-10 rounded-xl bg-[#E89D71]/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#E89D71]" />
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
                    ? 'bg-[#E89D71] text-white shadow-lg shadow-[#E89D71]/20'
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
                <p className="text-xs text-[#6B5A4E]">Your Careable account details</p>
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
                <p className="text-xs text-[#6B5A4E] font-medium">Member Since</p>
                <p className="text-sm text-[#2D1E17] font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>

            {profile?.special_needs && (
              <div className="flex items-start gap-4 p-4 bg-[#FEF3EB] rounded-2xl border border-[#E89D71]/20">
                <Heart className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#E89D71] font-bold uppercase tracking-wide mb-1">Special Needs</p>
                  <p className="text-sm text-[#6B5A4E] leading-relaxed">{profile.special_needs}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#E89D71] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors">
              Edit Personal Information
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#E89D71] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors">
              Notification Preferences
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-zinc-100 hover:border-[#E89D71] hover:shadow-lg transition-all group">
            <span className="font-semibold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors">
              Privacy & Security
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-4">
            Contact our support team or visit our help center for assistance.
          </p>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  )
}
