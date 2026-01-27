'use client'

import * as React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { getUserProfile, getUserRegistrations } from '@/app/actions/participant'
import { isFuture } from 'date-fns'
import { 
  User,
  Mail,
  Calendar,
  Shield,
  Award,
  Loader2,
  ChevronRight,
  Heart
} from 'lucide-react'

export default function VolunteerProfilePage() {
  const { user } = useUser()
  const { userId } = useAuth()
  const [profile, setProfile] = React.useState<any>(null)
  const [registrations, setRegistrations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

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


  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] animate-pulse"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] dark:text-zinc-300 font-medium text-center">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-[#E8F3F0] to-[#E8F3F0] dark:from-zinc-900 dark:via-zinc-900/50 dark:to-zinc-900/30 px-4 pt-6 pb-12 border-b border-[#86B1A4]/10 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-[#86B1A4]">
            <User className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 p-6 shadow-lg dark:shadow-zinc-900/50">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {user?.firstName?.[0] || profile?.full_name?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#2D1E17] dark:text-white">
                  {profile?.full_name || user?.fullName || 'Volunteer'}
                </h1>
                <p className="text-[#6B5A4E] dark:text-zinc-300 text-sm mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#E8F3F0] dark:bg-[#86B1A4]/20 text-[#86B1A4] rounded-full text-xs font-bold capitalize flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Volunteer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100 dark:border-zinc-800/50">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.filter(r => r.status === 'attended').length}
              </div>
              <div className="text-xs text-[#6B5A4E] dark:text-zinc-400 mt-1">Events Helped</div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100 dark:border-zinc-800/50">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.filter(r => isFuture(new Date(r.events.start_time))).length}
              </div>
              <div className="text-xs text-[#6B5A4E] dark:text-zinc-400 mt-1">Upcoming</div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100 dark:border-zinc-800/50">
              <div className="text-2xl font-bold text-[#86B1A4]">
                {registrations.length}
              </div>
              <div className="text-xs text-[#6B5A4E] dark:text-zinc-400 mt-1">Total</div>
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
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">Your Careable volunteer account</p>
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
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 font-medium">Volunteering Since</p>
                <p className="text-sm text-[#2D1E17] dark:text-white font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#86B1A4] hover:shadow-lg dark:hover:shadow-[#86B1A4]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#86B1A4] transition-colors">
              Edit Personal Information
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#86B1A4] hover:shadow-lg dark:hover:shadow-[#86B1A4]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#86B1A4] transition-colors">
              Volunteer Preferences
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>

          <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-[#86B1A4] hover:shadow-lg dark:hover:shadow-[#86B1A4]/20 transition-all group">
            <span className="font-semibold text-[#2D1E17] dark:text-white group-hover:text-[#86B1A4] transition-colors">
              Notification Settings
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#86B1A4] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Thank You Card */}
        <div className="bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] dark:from-[#86B1A4]/90 dark:to-[#6FA08F]/90 rounded-3xl p-8 text-center text-white shadow-xl dark:shadow-[#86B1A4]/20">
          <div className="w-16 h-16 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
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