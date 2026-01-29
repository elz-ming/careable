'use client';

import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Ticket, User, Users } from 'lucide-react';
import { PreferenceToggles } from '@/components/PreferenceToggles';
import { useTranslations } from '@/components/PreferencesProvider';
import { useUserRole } from '@/hooks/useUserRole';

export default function PortalClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const { role, theme, isCaregiver } = useUserRole();

  // Apply role-based theme to document root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-role', role);
  }, [role]);

  // Define navigation items based on role
  const navItems = React.useMemo(() => {
    const baseItems = [
      { href: '/dashboard', icon: Home, label: t.common.home },
      { href: '/events', icon: Calendar, label: t.common.discover },
      { href: '/registrations', icon: Ticket, label: t.common.myEvents },
      { href: '/profile', icon: User, label: t.common.profile },
    ];

    // Add participants management for caregivers
    if (isCaregiver) {
      return [
        ...baseItems.slice(0, 3),
        { href: '/participants', icon: Users, label: 'Participants' },
        ...baseItems.slice(3)
      ];
    }

    return baseItems;
  }, [t, isCaregiver]);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20 md:pb-0 transition-colors duration-300">
      {/* Mobile Top Header */}
      <header 
        className="flex items-center justify-between p-4 backdrop-blur-lg border-b sticky top-0 z-10 shadow-sm transition-all duration-300"
        style={{
          backgroundColor: theme.primary,
          borderColor: theme.dark
        }}
      >
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-white">Careable</h1>
            <div 
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5"
              style={{
                backgroundColor: theme.secondary,
                color: theme.dark
              }}
            >
              {theme.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PreferenceToggles />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 md:px-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t flex items-center justify-around py-2 px-1 md:hidden z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
        style={{
          backgroundColor: `${theme.primary}15`,
          borderColor: theme.secondary
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const hasExtraItem = navItems.length > 4; // Caregiver has 5 items
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                hasExtraItem ? 'px-2 py-1.5' : 'px-3 py-2'
              } ${
                isActive 
                  ? '' 
                  : 'hover:bg-white/50'
              }`}
              style={isActive ? {
                backgroundColor: theme.secondary,
                color: theme.dark
              } : {
                color: theme.primary
              }}
            >
              <Icon 
                className={hasExtraItem ? "w-4 h-4" : "w-5 h-5"} 
                style={isActive ? { color: theme.dark } : { color: theme.primary }}
              />
              <span 
                className={`font-bold ${hasExtraItem ? 'text-[9px]' : 'text-[10px]'}`}
                style={isActive ? { color: theme.dark } : { color: theme.primary }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
