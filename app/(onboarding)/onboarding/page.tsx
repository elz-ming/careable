'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@clerk/nextjs'
import { completeOnboarding } from './_actions'
import { createAndLinkParticipant } from '@/app/actions/caregiver'
import type { UserRole } from '@/lib/supabase/model'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function OnboardingPage() {
  const { session } = useSession()
  const router = useRouter()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [isCaregiver, setIsCaregiver] = React.useState(false)
  const [membershipType, setMembershipType] = React.useState('Ad hoc')
  const [loading, setLoading] = React.useState(false)
  
  // Caregiver-specific state
  const [showCaregiverForm, setShowCaregiverForm] = React.useState(false)
  const [participantName, setParticipantName] = React.useState('')
  const [relationship, setRelationship] = React.useState('parent')
  const [specialNeeds, setSpecialNeeds] = React.useState('')
  const [emergencyContact, setEmergencyContact] = React.useState('')

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    // If participant selected with caregiver checkbox, show caregiver form
    if (selectedRole === 'participant' && isCaregiver) {
      setShowCaregiverForm(true)
    }
  }

  const handleBackFromCaregiverForm = () => {
    setShowCaregiverForm(false)
    setRole(null)
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Logic: If participant is selected with caregiver checkbox, use 'caregiver' role
      const finalRole = (role === 'participant' && isCaregiver) ? 'caregiver' : role!;

      // If caregiver, create participant profile first
      if (finalRole === 'caregiver' && participantName.trim()) {
        const participantResult = await createAndLinkParticipant({
          participantFullName: participantName,
          relationship: relationship as any,
          specialNeeds: specialNeeds || undefined,
          emergencyContact: emergencyContact || undefined,
          membershipType: membershipType || undefined
        })

        if (!participantResult.success) {
          alert(participantResult.error || 'Failed to create participant profile')
          setLoading(false)
          return
        }
      }

      // Complete onboarding
      const result = await completeOnboarding({
        role: finalRole,
        membershipType: role === 'participant' ? membershipType : undefined,
      })

      if (result.success) {
        console.log('Onboarding success, reloading session...')
        await session?.reload()
        console.log('Performing hard redirect...')
        window.location.href = `/${finalRole}/dashboard`
      } else {
        alert(result.error || 'Something went wrong')
        setLoading(false)
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const cards = [
    {
      id: 'participant' as UserRole,
      title: 'Participant',
      desc: 'I want to join events or manage them for a child.',
      icon: '🧸',
      color: 'border-[#E89D71]',
      bg: 'bg-[#FEF3EB]',
      ring: 'ring-[#E89D71]/20'
    },
    {
      id: 'volunteer' as UserRole,
      title: 'Volunteer',
      desc: 'I want to give my time and support events.',
      icon: '🤝',
      color: 'border-[#86B1A4]',
      bg: 'bg-[#E8F3F0]',
      ring: 'ring-[#86B1A4]/20'
    },
    {
      id: 'staff' as UserRole,
      title: 'Staff',
      desc: 'I manage the daily operations and events.',
      icon: '🏢',
      color: 'border-[#6B5A4E]',
      bg: 'bg-[#F5F2F0]',
      ring: 'ring-[#6B5A4E]/20'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      desc: 'I oversee the entire platform and security.',
      icon: '🔐',
      color: 'border-[#2D1E17]',
      bg: 'bg-zinc-100',
      ring: 'ring-zinc-900/10'
    }
  ]

  // Caregiver Form View
  if (showCaregiverForm) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-[#4A3728]">
        <div className="max-w-2xl w-full space-y-6">
          <button 
            onClick={handleBackFromCaregiverForm}
            className="flex items-center gap-2 text-[#6B5A4E] hover:text-[#E89D71] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to role selection</span>
          </button>

          <div className="text-center space-y-2 mb-8">
            <div className="inline-block px-4 py-2 bg-[#FEF3EB] rounded-full text-sm font-bold text-[#E89D71] mb-2">
              Caregiver Setup
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2D1E17]">
              Tell Us About Your Participant
            </h1>
            <p className="text-[#6B5A4E] max-w-md mx-auto">
              We need some information about the individual you'll be registering for events.
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-zinc-100 p-8 space-y-6 shadow-lg">
            {/* Participant Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D1E17] flex items-center gap-1">
                Participant's Full Name <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text"
                placeholder="e.g., John Tan Wei Ming"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="h-12 rounded-xl border-2 focus:border-[#E89D71] focus:ring-[#E89D71]"
                required
              />
              <p className="text-xs text-[#6B5A4E]">The full legal name of the child or individual with special needs</p>
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D1E17] flex items-center gap-1">
                Your Relationship <span className="text-red-500">*</span>
              </label>
              <select 
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 bg-white focus:border-[#E89D71] focus:ring-[#E89D71] focus:outline-none font-medium"
              >
                <option value="parent">Parent</option>
                <option value="guardian">Legal Guardian</option>
                <option value="sibling">Sibling</option>
                <option value="relative">Other Relative</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Membership Type */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D1E17]">
                Participation Frequency
              </label>
              <select 
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 bg-white focus:border-[#E89D71] focus:ring-[#E89D71] focus:outline-none font-medium"
              >
                <option value="Ad hoc">Ad hoc (As available)</option>
                <option value="Once a week">Once a week</option>
                <option value="Twice a week">Twice a week</option>
              </select>
            </div>

            {/* Special Needs */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D1E17]">
                Special Needs or Accessibility Requirements
              </label>
              <textarea 
                placeholder="e.g., Wheelchair accessible, sensory-friendly environment, dietary restrictions..."
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white focus:border-[#E89D71] focus:ring-[#E89D71] focus:outline-none resize-none"
              />
              <p className="text-xs text-[#6B5A4E]">This helps us better accommodate your participant</p>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D1E17]">
                Emergency Contact Number
              </label>
              <Input 
                type="tel"
                placeholder="+65 1234 5678"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="h-12 rounded-xl border-2 focus:border-[#E89D71] focus:ring-[#E89D71]"
              />
              <p className="text-xs text-[#6B5A4E]">A number we can reach you at during events</p>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 leading-relaxed">
                <p className="font-semibold mb-1">Important Information</p>
                <p>You'll be able to register your participant for events and manage their profile after completing this setup.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading || !participantName.trim()}
              onClick={handleComplete}
              className="w-full py-4 bg-[#E89D71] text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D88C61] shadow-lg shadow-[#E89D71]/30"
            >
              {loading ? 'Setting up your account...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Original Role Selection View
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-[#4A3728]">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-2 bg-[#FEF3EB] rounded-full text-sm font-bold text-[#E89D71] mb-2">
            Welcome to Careable
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#2D1E17]">Choose Your Role</h1>
          <p className="text-lg text-[#6B5A4E]">Select how you'd like to participate in our community</p>
        </div>

        {/* 4-Card Role Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {cards.map((item) => (
            <div 
              key={item.id}
              onClick={() => setRole(item.id)}
              className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 bg-white shadow-sm hover:shadow-md ${
                role === item.id ? `${item.color} ring-2 ${item.ring}` : 'border-zinc-100'
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center text-xl`}>
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2D1E17]">{item.title}</h2>
                  <p className="text-sm text-[#6B5A4E] leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {role === item.id && (
                <div className="pt-4 border-t border-zinc-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {item.id === 'participant' && (
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-[#FEF3EB] border border-[#E89D71]/20">
                        <input 
                          type="checkbox" 
                          checked={isCaregiver}
                          onChange={(e) => setIsCaregiver(e.target.checked)}
                          className="w-5 h-5 rounded border-[#E89D71] text-[#E89D71] mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-bold text-[#E89D71] block">I'm a Caregiver</span>
                          <span className="text-xs text-[#6B5A4E]">Registering for someone else (child with special needs)</span>
                        </div>
                      </label>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#6B5A4E] uppercase tracking-wide">
                          Participation Frequency
                        </label>
                        <select 
                          value={membershipType}
                          onChange={(e) => setMembershipType(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border-2 border-zinc-200 bg-white text-sm focus:outline-none focus:border-[#E89D71] font-medium"
                        >
                          <option>Ad hoc</option>
                          <option>Once a week</option>
                          <option>Twice a week</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    disabled={loading}
                    onClick={() => {
                      if (item.id === 'participant' && isCaregiver) {
                        setShowCaregiverForm(true)
                      } else {
                        handleComplete()
                      }
                    }}
                    className={`w-full py-3 px-4 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg ${
                      item.id === 'admin' ? 'bg-[#2D1E17] shadow-[#2D1E17]/20' : 
                      item.id === 'staff' ? 'bg-[#6B5A4E] shadow-[#6B5A4E]/20' :
                      item.id === 'volunteer' ? 'bg-[#86B1A4] shadow-[#86B1A4]/20' : 'bg-[#E89D71] shadow-[#E89D71]/20'
                    }`}
                  >
                    {loading ? 'Setting up...' : 
                     (item.id === 'participant' && isCaregiver) ? 'Continue Setup →' :
                     `Start as ${item.title}`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-400 pt-8">
          Demo Mode: Selection will automatically update your Clerk metadata and Supabase profile.
        </p>
      </div>
    </div>
  )
}
