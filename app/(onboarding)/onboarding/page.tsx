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
  
  // Participant -> Caregiver linking
  const [caregiverName, setCaregiverName] = React.useState('')
  const [caregiverEmail, setCaregiverEmail] = React.useState('')
  const [noCaregiver, setNoCaregiver] = React.useState(false)
  
  // Caregiver -> Participant linking
  const [participantEmail, setParticipantEmail] = React.useState('')
  const [noParticipantAccount, setNoParticipantAccount] = React.useState(false)

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
      const finalRole = role!

      // Participant flow: Complete onboarding with caregiver linking info
      if (finalRole === 'participant') {
        const result = await completeOnboarding({
          role: finalRole,
          membershipType: membershipType || undefined,
          // Linking information
          caregiverName: caregiverName.trim() || undefined,
          caregiverEmail: caregiverEmail.trim() || undefined,
          emergencyContact: emergencyContact || undefined,
        })

        if (result.success) {
          console.log('Onboarding success, reloading session...')
          await session?.reload()
          console.log('Performing hard redirect...')
          window.location.href = `/dashboard`
        } else {
          alert(result.error || 'Something went wrong')
          setLoading(false)
        }
        return
      }

      // Caregiver flow: Create participant profile and link
      if (finalRole === 'caregiver' && participantName.trim()) {
        const participantResult = await createAndLinkParticipant({
          participantFullName: participantName,
          participantEmail: participantEmail.trim() || undefined,
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

      // Complete onboarding for caregiver
      const result = await completeOnboarding({
        role: finalRole,
        membershipType: undefined,
      })

      if (result.success) {
        console.log('Onboarding success, reloading session...')
        await session?.reload()
        console.log('Performing hard redirect...')
        window.location.href = `/dashboard`
      } else {
        alert(result.error || 'Something went wrong')
        setLoading(false)
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const [expandedCard, setExpandedCard] = React.useState<UserRole | null>(null)

  const splitColumnCards = [
    {
      id: 'participant' as UserRole,
      title: 'Participant',
      desc: 'I want to join events.',
      cardBg: 'bg-[#FEF3EB]',
      color: 'border-[#E89D71]',
      ring: 'ring-[#E89D71]/20',
      buttonBg: 'bg-[#E89D71]',
      shadowColor: 'shadow-[#E89D71]/20',
      textColor: 'text-[#2D1E17]'
    },
    {
      id: 'caregiver' as UserRole,
      title: 'Caregiver',
      desc: 'I want to register and manage events for someone with special needs.',
      shortDesc: 'I want to register events for someone...',
      cardBg: 'bg-[#FCE7F3]',
      color: 'border-[#EC4899]',
      ring: 'ring-[#EC4899]/20',
      buttonBg: 'bg-[#EC4899]',
      shadowColor: 'shadow-[#EC4899]/20',
      textColor: 'text-[#2D1E17]'
    }
  ]

  const mainCards = [
    {
      id: 'volunteer' as UserRole,
      title: 'Volunteer',
      desc: 'I want to give my time and support events.',
      cardBg: 'bg-[#E8F3F0]',
      color: 'border-[#86B1A4]',
      ring: 'ring-[#86B1A4]/20',
      buttonBg: 'bg-[#86B1A4]',
      shadowColor: 'shadow-[#86B1A4]/20',
      textColor: 'text-[#2D1E17]'
    },
    {
      id: 'staff' as UserRole,
      title: 'Staff',
      desc: 'I manage the daily operations and events.',
      cardBg: 'bg-[#F5F2F0]',
      color: 'border-[#6B5A4E]',
      ring: 'ring-[#6B5A4E]/20',
      buttonBg: 'bg-[#6B5A4E]',
      shadowColor: 'shadow-[#6B5A4E]/20',
      textColor: 'text-[#2D1E17]'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      desc: 'I oversee the entire platform and security.',
      cardBg: 'bg-zinc-100',
      color: 'border-[#2D1E17]',
      ring: 'ring-zinc-900/10',
      buttonBg: 'bg-[#2D1E17]',
      shadowColor: 'shadow-[#2D1E17]/20',
      textColor: 'text-[#2D1E17]'
    }
  ]

  // Form View (for both Participant and Caregiver)
  if (showCaregiverForm) {
    const isParticipantFlow = role === 'participant'
    const isCaregiverFlow = role === 'caregiver'
    const themeColor = isParticipantFlow ? '#E89D71' : '#EC4899'
    const themeBg = isParticipantFlow ? '#FEF3EB' : '#FCE7F3'
    const themeHover = isParticipantFlow ? '#D88C61' : '#DB2777'
    
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-[#4A3728]">
        <div className="max-w-2xl w-full space-y-6">
          <button 
            onClick={handleBackFromCaregiverForm}
            className="flex items-center gap-2 text-[#6B5A4E] transition-colors mb-4"
            style={{ color: '#6B5A4E' }}
            onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B5A4E'}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to role selection</span>
          </button>

          <div className="text-center space-y-2 mb-8">
            <div 
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-2"
              style={{ backgroundColor: themeBg, color: themeColor }}
            >
              {isParticipantFlow ? 'Participant' : 'Caregiver'} Setup
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2D1E17]">
              {isParticipantFlow ? 'Tell Us About Your Caregiver' : 'Tell Us About Your Participant'}
            </h1>
            <p className="text-[#6B5A4E] max-w-md mx-auto">
              {isParticipantFlow 
                ? "We'll try to match you with your caregiver's account, or keep this as emergency contact info."
                : "We'll try to match you with your participant's account, or keep this as emergency contact info."}
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-zinc-100 p-8 space-y-6 shadow-lg">
            {isParticipantFlow ? (
              <>
                {/* Checkbox: I do not have a caregiver */}
                <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: noCaregiver ? '#FEF3EB' : 'transparent',
                    borderColor: noCaregiver ? themeColor : '#E5E7EB'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={noCaregiver}
                    onChange={(e) => {
                      setNoCaregiver(e.target.checked)
                      if (e.target.checked) {
                        setCaregiverName('')
                        setCaregiverEmail('')
                      }
                    }}
                    className="w-5 h-5 rounded border-2 mt-0.5"
                    style={{ 
                      borderColor: themeColor,
                      accentColor: themeColor
                    }}
                  />
                  <div>
                    <span className="text-sm font-bold text-[#2D1E17] block">I do not have a caregiver</span>
                    <span className="text-xs text-[#6B5A4E]">Skip linking with a caregiver account</span>
                  </div>
                </label>

                {!noCaregiver && (
                  <>
                    {/* Caregiver's Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2D1E17] flex items-center gap-1">
                        Caregiver's Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="text"
                        placeholder="e.g., Mary Tan"
                        value={caregiverName}
                        onChange={(e) => setCaregiverName(e.target.value)}
                        className="h-12 rounded-xl border-2"
                        style={{ borderColor: '#E5E7EB', focusBorderColor: themeColor }}
                        required
                      />
                      <p className="text-xs text-[#6B5A4E]">The full name of your caregiver or guardian</p>
                    </div>

                    {/* Caregiver's Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2D1E17] flex items-center gap-1">
                        Caregiver's Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="email"
                        placeholder="e.g., mary.tan@email.com"
                        value={caregiverEmail}
                        onChange={(e) => setCaregiverEmail(e.target.value)}
                        className="h-12 rounded-xl border-2"
                        style={{ borderColor: '#E5E7EB' }}
                        required
                      />
                      <p className="text-xs text-[#6B5A4E]">We'll try to link your accounts or use this as emergency contact</p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Checkbox: My care receiver does not have an account */}
                <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all"
                  style={{ 
                    backgroundColor: noParticipantAccount ? '#FCE7F3' : 'transparent',
                    borderColor: noParticipantAccount ? themeColor : '#E5E7EB'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={noParticipantAccount}
                    onChange={(e) => {
                      setNoParticipantAccount(e.target.checked)
                      if (e.target.checked) {
                        setParticipantName('')
                        setParticipantEmail('')
                      }
                    }}
                    className="w-5 h-5 rounded border-2 mt-0.5"
                    style={{ 
                      borderColor: themeColor,
                      accentColor: themeColor
                    }}
                  />
                  <div>
                    <span className="text-sm font-bold text-[#2D1E17] block">My care receiver does not have an account</span>
                    <span className="text-xs text-[#6B5A4E]">Skip linking with a participant account</span>
                  </div>
                </label>

                {!noParticipantAccount && (
                  <>
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
                        className="h-12 rounded-xl border-2 focus:border-[#EC4899] focus:ring-[#EC4899]"
                        required
                      />
                      <p className="text-xs text-[#6B5A4E]">The full name of the participant</p>
                    </div>

                    {/* Participant Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2D1E17]">
                        Participant's Email Address (if available)
                      </label>
                      <Input 
                        type="email"
                        placeholder="e.g., john.tan@email.com"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        className="h-12 rounded-xl border-2 focus:border-[#EC4899] focus:ring-[#EC4899]"
                      />
                      <p className="text-xs text-[#6B5A4E]">We'll try to link your accounts if they have an existing account</p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Important Notice */}
            {((isParticipantFlow && !noCaregiver) || (!isParticipantFlow && !noParticipantAccount)) && (
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">Account Linking</p>
                  <p>
                    {isParticipantFlow 
                      ? "We'll try to find and link your caregiver's account. If not found, this will be saved as emergency contact information."
                      : "We'll try to find and link your participant's account. If not found, this will be saved as emergency contact information."}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              disabled={loading || (
                isParticipantFlow 
                  ? (!noCaregiver && (!caregiverName.trim() || !caregiverEmail.trim()))
                  : (!noParticipantAccount && !participantName.trim())
              )}
              onClick={handleComplete}
              className="w-full py-4 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-8"
              style={{ 
                backgroundColor: themeColor,
                boxShadow: `0 10px 40px -10px ${themeColor}30`
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = themeHover)}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = themeColor)}
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

        {/* Role Grid: Split column + 3 full columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-12">
          {/* First Column: Split Participant/Caregiver */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
            {splitColumnCards.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setRole(item.id)
                  if (item.id === 'caregiver') {
                    setIsCaregiver(true)
                    setShowCaregiverForm(true)
                  } else if (item.id === 'participant') {
                    setIsCaregiver(false)
                    setShowCaregiverForm(true) // Show form for participant too
                  }
                }}
                className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  item.cardBg
                } ${
                  role === item.id ? `${item.color} ring-2 ${item.ring}` : 'border-zinc-100'
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <h2 className={`text-lg lg:text-xl font-bold ${item.textColor}`}>{item.title}</h2>
                    <div className="text-sm text-[#6B5A4E] leading-relaxed">
                      {item.id === 'caregiver' ? (
                        <>
                          <p>{expandedCard === item.id ? item.desc : (item as any).shortDesc}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedCard(expandedCard === item.id ? null : item.id)
                            }}
                            className="text-xs font-semibold mt-1 underline"
                            style={{ color: item.buttonBg.replace('bg-', '#') }}
                          >
                            {expandedCard === item.id ? 'Show less' : 'Read more'}
                          </button>
                        </>
                      ) : (
                        <p>{item.desc}</p>
                      )}
                    </div>
                  </div>
                </div>

                {role === item.id && (
                  <div className="pt-4 border-t border-white/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {item.id === 'participant' && (
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
                    )}
                    
                    <button 
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowCaregiverForm(true)
                      }}
                      className={`w-full py-3 px-4 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg ${item.buttonBg} ${item.shadowColor}`}
                    >
                      {loading ? 'Setting up...' : 'Continue Setup →'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Remaining 3 Columns: Volunteer, Staff, Admin */}
          {mainCards.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                setRole(item.id)
                setIsCaregiver(false)
              }}
              className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                item.cardBg
              } ${
                role === item.id ? `${item.color} ring-2 ${item.ring}` : 'border-zinc-100'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <h2 className={`text-lg lg:text-xl font-bold ${item.textColor}`}>{item.title}</h2>
                  <p className="text-sm text-[#6B5A4E] leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {role === item.id && (
                <div className="pt-4 border-t border-white/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <button 
                    disabled={loading}
                    onClick={handleComplete}
                    className={`w-full py-3 px-4 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg ${item.buttonBg} ${item.shadowColor}`}
                  >
                    {loading ? 'Setting up...' : `Start as ${item.title}`}
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
