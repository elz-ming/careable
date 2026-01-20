'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@clerk/nextjs'
import { completeOnboarding } from './_actions'
import type { UserRole } from '@/lib/supabase/model'

export default function OnboardingPage() {
  const { session } = useSession()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [isCaregiver, setIsCaregiver] = React.useState(false)
  const [membershipType, setMembershipType] = React.useState('Ad hoc')
  const [loading, setLoading] = React.useState(false)

  const handleComplete = async (selectedRole: UserRole) => {
    setLoading(true)
    
    // Logic: If participant is selected with caregiver checkbox, use 'caregiver' role
    const finalRole = (selectedRole === 'participant' && isCaregiver) ? 'caregiver' : selectedRole;

    const result = await completeOnboarding({
      role: finalRole,
      membershipType: selectedRole === 'participant' ? membershipType : undefined,
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

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-[#4A3728]">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[#2D1E17]">Welcome to Careable</h1>
          <p className="text-lg text-[#6B5A4E]">Select a role to enter the demo experience.</p>
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
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isCaregiver}
                          onChange={(e) => setIsCaregiver(e.target.checked)}
                          className="w-4 h-4 rounded border-[#E89D71] text-[#E89D71]"
                        />
                        <span className="text-xs font-medium italic">Assign as Caregiver?</span>
                      </label>
                      <select 
                        value={membershipType}
                        onChange={(e) => setMembershipType(e.target.value)}
                        className="w-full p-2 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none"
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
                      e.stopPropagation();
                      handleComplete(item.id);
                    }}
                    className={`w-full py-2 px-4 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
                      item.id === 'admin' ? 'bg-[#2D1E17]' : 
                      item.id === 'staff' ? 'bg-[#6B5A4E]' :
                      item.id === 'volunteer' ? 'bg-[#86B1A4]' : 'bg-[#E89D71]'
                    }`}
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
