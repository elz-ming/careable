'use client'

import * as React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { getUserProfile } from '@/app/actions/participant'
import { 
  User,
  Mail,
  Calendar,
  Shield,
  Heart,
  Loader2,
  ChevronRight
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useUser()
  const { userId } = useAuth()
  const [profile, setProfile] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const result = await getUserProfile()
      if (result.success) {
        setProfile(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E89D71] to-[#D88C61] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] dark:text-zinc-300 font-medium text-center">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#FEF3EB] to-[#FEF3EB] dark:from-zinc-900 dark:via-zinc-900/50 dark:to-zinc-900/30 px-4 pt-6 pb-12 border-b border-[#E89D71]/10 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-[#E89D71]">
            <User className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 p-6 shadow-lg dark:shadow-zinc-900/50">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E89D71] to-[#D88C61] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {user?.firstName?.[0] || profile?.full_name?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#2D1E17] dark:text-white">
                  {profile?.full_name || user?.fullName || 'Guest User'}
                </h1>
                <p className="text-[#6B5A4E] dark:text-zinc-300 text-sm mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#FEF3EB] dark:bg-[#E89D71]/20 text-[#E89D71] rounded-full text-xs font-bold capitalize">
                    {profile?.role || 'Participant'}
                  </span>
                  {profile?.membership_type && (
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[#6B5A4E] dark:text-zinc-300 rounded-full text-xs font-medium">
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
        {/* Account Information */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 overflow-hidden shadow-sm dark:shadow-zinc-900/50">
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold text-[#2D1E17] dark:text-white">Account Information</h2>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">Your Careable account details</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <Mail className="w-5 h-5 text-[#6B5A4E] dark:text-zinc-400" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 font-medium">Email Address</p>
                <p className="text-sm text-[#2D1E17] dark:text-white font-semibold">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <Calendar className="w-5 h-5 text-[#6B5A4E] dark:text-zinc-400" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 font-medium">Member Since</p>
                <p className="text-sm text-[#2D1E17] dark:text-white font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>

            {profile?.special_needs && (
              <div className="flex items-start gap-4 p-4 bg-[#FEF3EB] dark:bg-[#E89D71]/10 rounded-2xl border border-[#E89D71]/20 dark:border-[#E89D71]/30">
                <Heart className="w-5 h-5 text-[#E89D71] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#E89D71] font-bold uppercase tracking-wide mb-1">Special Needs</p>
                  <p className="text-sm text-[#6B5A4E] dark:text-zinc-300 leading-relaxed">{profile.special_needs}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#E89D71] hover:shadow-lg dark:hover:shadow-[#E89D71]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#E89D71] transition-colors">
              Edit Personal Information
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#E89D71] hover:shadow-lg dark:hover:shadow-[#E89D71]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#E89D71] transition-colors">
              Notification Preferences
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#E89D71] hover:shadow-lg dark:hover:shadow-[#E89D71]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#E89D71] transition-colors">
              Privacy & Security
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#E89D71] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
            Contact our support team or visit our help center for assistance.
          </p>
          <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  )
}
