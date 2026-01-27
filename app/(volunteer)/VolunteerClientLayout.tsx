'use client';

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Ticket, User } from "lucide-react";
import { PreferenceToggles } from "@/components/PreferenceToggles";
import { useTranslations } from "@/components/PreferencesProvider";

export default function VolunteerClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();

  const navItems = [
    { href: "/volunteer/dashboard", icon: Home, label: t.common.home },
    { href: "/volunteer/opportunities", icon: Calendar, label: t.common.discover },
    { href: "/volunteer/registrations", icon: Ticket, label: t.common.myEvents },
    { href: "/volunteer/profile", icon: User, label: t.common.profile },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0a0a0a] pb-20 md:pb-0 transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm dark:shadow-zinc-900/50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#86B1A4] to-[#6FA08F] flex items-center justify-center text-white font-bold shadow-sm">
            🤝
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2D1E17] dark:text-white">{t.nav.caregiverPortal.split(' ')[0]}</h1>
            <p className="text-[10px] text-[#6B5A4E] dark:text-zinc-400">{t.nav.volunteerPortal}</p>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around py-2 px-2 md:hidden z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/volunteer/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#86B1A4] bg-[#E8F3F0] dark:bg-[#86B1A4]/20' 
                  : 'text-[#6B5A4E] dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#86B1A4]' : 'text-[#6B5A4E] dark:text-zinc-400'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#86B1A4]' : 'text-[#6B5A4E] dark:text-zinc-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
