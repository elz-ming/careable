'use client';

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Ticket, User } from "lucide-react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/participant/dashboard", icon: Home, label: "Home" },
    { href: "/participant/events", icon: Calendar, label: "Discover" },
    { href: "/participant/registrations", icon: Ticket, label: "My Events" },
    { href: "/participant/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF9] pb-20 md:pb-0">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E89D71] to-[#D88C61] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">🧡</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2D1E17]">Careable</h1>
            <p className="text-[10px] text-[#6B5A4E]">Participant Portal</p>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-2 px-2 md:hidden z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/participant/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#E89D71] bg-[#FEF3EB]' 
                  : 'text-[#6B5A4E] hover:bg-zinc-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E89D71]' : 'text-[#6B5A4E]'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#E89D71]' : 'text-[#6B5A4E]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
