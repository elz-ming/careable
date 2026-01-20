import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations } from '@/lib/supabase/db';
import AttendanceQR from '@/src/components/AttendanceQR';
import { getParticipantEvents } from '@/app/actions/participant';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function ParticipantDashboard() {
  const { userId } = await auth();
  const registrations = await getUserRegistrations(userId!);
  const eventsRes = await getParticipantEvents();
  const availableEvents = (eventsRes.data || []).slice(0, 3); // Show top 3

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-white to-[#FEF3EB] p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#2D1E17]">Welcome to Careable!</h2>
          <p className="text-[#6B5A4E] text-lg">Your journey to wellness and community starts here.</p>
        </div>
        <Link href="/participant/events">
          <Button className="bg-[#E89D71] hover:bg-[#D88C61] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-[#E89D71]/20">
            Browse All Events
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Registered Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#E89D71]" />
              My Upcoming Events
            </h3>
          </div>
          {registrations.length > 0 ? (
            <div className="grid gap-4">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#2D1E17]">{reg.events.title}</h4>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(reg.events.start_time), 'EEE, dd MMM')}
                    </p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {reg.events.location}
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
            <div className="bg-white p-10 rounded-2xl border border-dashed border-zinc-200 text-center">
              <p className="text-zinc-400">You haven't joined any events yet.</p>
              <Link href="/participant/events">
                <Button variant="link" className="text-[#E89D71] font-bold mt-2">Find your first event</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Suggested Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E89D71]" />
              New Opportunities
            </h3>
            <Link href="/participant/events" className="text-xs font-bold text-[#E89D71] hover:underline">View All</Link>
          </div>
          <div className="grid gap-4">
            {availableEvents.length > 0 ? (
              availableEvents.map((event: any) => (
                <Link key={event.id} href={`/participant/events/${event.id}`}>
                  <div className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md hover:border-[#E89D71]/20 transition-all group">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors">{event.title}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-1">{event.location}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#E89D71] transform group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-10 bg-zinc-50 rounded-2xl">No new events at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
