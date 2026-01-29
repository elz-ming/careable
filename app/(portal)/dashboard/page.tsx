import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations, getParticipantEvents } from '@/app/actions/participant';
import AttendanceQR from '@/src/components/AttendanceQR';
import { Calendar as CalendarIcon, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCurrentUserRole, getRoleLabels } from '@/lib/role-utils';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const role = await getCurrentUserRole();
  
  // Only allow portal roles, redirect if admin/staff
  if (role === 'admin' || role === 'staff') {
    redirect(`/${role}/dashboard`);
  }
  
  const labels = getRoleLabels(role as 'volunteer' | 'caregiver' | 'participant');
  
  // Fetch data
  const registrationsRes = await getUserRegistrations();
  const allRegistrations = registrationsRes.data || [];
  
  // Sort: registered first, then attended, take top 3
  const sortedRegistrations = [...allRegistrations].sort((a, b) => {
    if (a.status === 'registered' && b.status !== 'registered') return -1;
    if (a.status !== 'registered' && b.status === 'registered') return 1;
    return 0;
  });
  const registrations = sortedRegistrations.slice(0, 3);
  
  const eventsRes = await getParticipantEvents();
  const availableEvents = (eventsRes.data || []).slice(0, 3);

  // Get theme colors based on role
  const themeColors = {
    volunteer: {
      primary: '#86B1A4',
      secondary: '#D4E8E3',
      gradient: 'from-[#E8F3F0] to-white',
      bgColor: '#E8F3F0',
      iconColor: '#86B1A4'
    },
    caregiver: {
      primary: '#EC4899',
      secondary: '#FCE7F3',
      gradient: 'from-[#FCE7F3] to-white',
      bgColor: '#FCE7F3',
      iconColor: '#EC4899'
    },
    participant: {
      primary: '#E89D71',
      secondary: '#FEF3EB',
      gradient: 'from-[#FEF3EB] to-white',
      bgColor: '#FEF3EB',
      iconColor: '#E89D71'
    }
  }[role];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Header - Integrated into background */}
      <div 
        className={`bg-gradient-to-br ${themeColors.gradient} px-4 py-6 -mx-4 -mt-4 flex flex-col md:flex-row justify-between items-center gap-4`}
      >
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-[#2D1E17]">
            {labels.welcomeTitle}
          </h2>
          <p className="text-[#6B5A4E] text-sm md:text-base">
            {labels.welcomeSubtitle}
          </p>
        </div>
        <Link href="/events">
          <Button 
            className="text-white rounded-xl h-10 px-6 font-bold shadow-lg transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: themeColors.primary,
              boxShadow: `0 10px 25px -5px ${themeColors.primary}40`
            }}
          >
            {labels.discoverCTA}
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        {/* Left Column: Registered Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" style={{ color: themeColors.iconColor }} />
              Registered Events
            </h3>
            {allRegistrations.length > 3 && (
              <Link 
                href="/registrations" 
                className="text-xs font-bold hover:underline"
                style={{ color: themeColors.primary }}
              >
                View More
              </Link>
            )}
          </div>
          {registrations.length > 0 ? (
            <div className="grid gap-3">
              {registrations.map((reg: any) => (
                <div 
                  key={reg.id} 
                  className="bg-white p-4 rounded-xl border border-zinc-100 flex justify-between items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="font-bold text-[#2D1E17] text-sm leading-tight truncate">{reg.events.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                        style={{
                          backgroundColor: themeColors.secondary,
                          color: themeColors.primary
                        }}
                      >
                        {format(new Date(reg.events.start_time), 'EEE, dd MMM')}
                      </div>
                      <div 
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap",
                          reg.status === 'attended' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {reg.status}
                      </div>
                    </div>
                  </div>
                  {reg.status !== 'attended' && (
                    <AttendanceQR 
                      registrationId={reg.id} 
                      eventTitle={reg.events.title}
                      compact={true}
                      themeColor={themeColors.primary}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-zinc-200 text-center">
              <Heart className="w-10 h-10 text-zinc-100 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">
                {role === 'volunteer' ? 'Ready to help out?' : "You haven't joined any events yet."}
              </p>
              <Link href="/events">
                <Button 
                  variant="link" 
                  className="font-bold mt-2 text-sm"
                  style={{ color: themeColors.primary }}
                >
                  {role === 'volunteer' ? 'Find an opportunity' : 'Find your first event'}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Suggested Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: themeColors.iconColor }} />
              {labels.suggestedTitle}
            </h3>
            <Link href="/events" className="text-xs font-bold hover:underline" style={{ color: themeColors.primary }}>
              View All
            </Link>
          </div>
          <div className="grid gap-3">
            {availableEvents.length > 0 ? (
              availableEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div 
                    className="bg-white p-4 rounded-xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md hover:border-opacity-20 transition-all group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-bold text-[#2D1E17] text-sm leading-tight truncate">{event.title}</h4>
                      <p className="text-xs text-zinc-500 truncate">{event.location}</p>
                    </div>
                    <ChevronRight 
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-all shrink-0" 
                      style={{
                        color: themeColors.primary
                      }}
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white p-10 rounded-2xl border border-dashed border-zinc-200 text-center">
                <p className="text-zinc-400 text-sm">
                  No new {role === 'volunteer' ? 'opportunities' : 'events'} at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
