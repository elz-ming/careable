import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AdminLogoutButton } from "./_components/AdminLogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop Sidebar: fixed height, nav scrolls, logout pinned to bottom */}
      <aside className="hidden md:flex w-64 shrink-0 h-full flex-col bg-[#2D1E17] text-white">
        <div className="flex h-full flex-col">
          <div className="p-6 shrink-0">
            <h1 className="text-xl font-bold tracking-tight">Careable Admin</h1>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Executive View</Link>
            <Link href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">User Management</Link>
            <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Settings</Link>
          </nav>
          <div className="mt-auto shrink-0 p-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <UserButton afterSignOutUrl="/sign-in" />
              <span className="text-sm font-medium opacity-60">Admin Portal</span>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content: only this area scrolls */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="md:hidden shrink-0 flex items-center justify-between p-4 bg-white border-b gap-2">
          <h1 className="text-lg font-bold text-[#2D1E17]">Careable Admin</h1>
          <div className="flex items-center gap-2">
            <AdminLogoutButton variant="header" />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
