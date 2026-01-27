import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations } from '@/app/actions/participant';
import AttendanceQR from '@/src/components/AttendanceQR';
import { getParticipantEvents } from '@/app/actions/participant';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default async function VolunteerDashboard() {
  const { userId } = await auth();
  const registrationsRes = await getUserRegistrations();
  const registrations = registrationsRes.data || [];
  const eventsRes = await getParticipantEvents();
  const availableEvents = (eventsRes.data || []).slice(0, 3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-br from-white to-[#E8F3F0] dark:from-zinc-900/50 dark:to-zinc-900/30 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-sm">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D1E17] dark:text-white">Volunteer with Purpose!</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 text-base md:text-lg">Your support makes our community stronger every day.</p>
        </div>
        <Link href="/volunteer/opportunities">
          <Button className="bg-[#86B1A4] hover:bg-[#759E92] dark:bg-[#86B1A4] dark:hover:bg-[#759E92] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-[#86B1A4]/20 dark:shadow-[#86B1A4]/30 transition-all hover:scale-[1.02]">
            View Opportunities
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Registered Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#86B1A4]" />
              My Registered Events
            </h3>
          </div>
          {registrations.length > 0 ? (
            <div className="grid gap-4">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center shadow-sm dark:shadow-zinc-900/50 hover:shadow-md dark:hover:shadow-zinc-900 transition-shadow">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#2D1E17] dark:text-white">{reg.events.title}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(reg.events.start_time), 'EEE, dd MMM')}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {reg.events.location}
                    </p>
                    <p className="text-[10px] mt-1 text-zinc-600 dark:text-zinc-400">
                      Status: <span className={cn("font-bold uppercase tracking-wider", reg.status === 'attended' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400')}>
                        {reg.status}
                      </span>
                    </p>
                  </div>
                  {reg.status !== 'attended' && (
                    <AttendanceQR 
                      registrationId={reg.id} 
                      eventTitle={reg.events.title} 
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/50 text-center">
              <Heart className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mx-auto mb-3" />
              <p className="text-zinc-400 dark:text-zinc-500">Ready to help out?</p>
              <Link href="/volunteer/opportunities">
                <Button variant="link" className="text-[#86B1A4] font-bold mt-2">Find an opportunity</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Suggested Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#86B1A4]" />
              Latest Needs
            </h3>
            <Link href="/volunteer/opportunities" className="text-xs font-bold text-[#86B1A4] hover:underline">View All</Link>
          </div>
          <div className="grid gap-4">
            {availableEvents.length > 0 ? (
              availableEvents.map((event: any) => (
                <Link key={event.id} href={`/volunteer/opportunities/${event.id}`}>
                  <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center shadow-sm dark:shadow-zinc-900/50 hover:shadow-md dark:hover:shadow-zinc-900 hover:border-[#86B1A4]/20 dark:hover:border-[#86B1A4]/50 transition-all group">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#2D1E17] dark:text-white group-hover:text-[#86B1A4] transition-colors">{event.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{event.location}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#86B1A4] transform group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-400 dark:text-zinc-500 text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl">No new opportunities at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
