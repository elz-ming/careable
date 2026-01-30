'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

type AdminLogoutButtonProps = {
  /** 'sidebar' = dark sidebar (light text); 'header' = light mobile header (dark text) */
  variant?: 'sidebar' | 'header';
};

export function AdminLogoutButton({ variant = 'sidebar' }: AdminLogoutButtonProps) {
  const { signOut } = useClerk();

  const isHeader = variant === 'header';
  const className = isHeader
    ? 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#2D1E17] hover:bg-zinc-100 transition-colors'
    : 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors';

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: '/sign-in' })}
      className={className}
      aria-label="Log out"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      Log out
    </button>
  );
}
