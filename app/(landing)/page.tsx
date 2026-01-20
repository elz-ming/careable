import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getParticipantEvents } from "@/app/actions/participant";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, ChevronRight } from "lucide-react";

export default async function LandingPage() {
  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;
  const eventsRes = await getParticipantEvents();
  const featuredEvents = (eventsRes.data || []).slice(0, 3);

  // Determine the "Get Started" destination
  let getStartedHref = "/sign-up";
  if (userId) {
    getStartedHref = role ? `/${role}/dashboard` : "/onboarding";
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF9] font-sans text-[#4A3728]">
      <main className="flex-1 flex flex-col items-center px-6 py-20 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block px-4 py-1.5 bg-[#FEF3EB] rounded-full text-sm font-bold text-[#E89D71] mb-4">
            Welcome to Careable
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#2D1E17] leading-[1.1]">
            Empowering Every Child, <br />
            <span className="text-[#E89D71]">Supporting Every Caregiver.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#6B5A4E] max-w-2xl mx-auto leading-relaxed">
            A centralized platform for managing events, volunteering, and support for children with disabilities. 
            Join our community of care today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-20">
            <Link 
              href={getStartedHref}
              className="w-full sm:w-auto px-8 py-4 bg-[#E89D71] text-white rounded-2xl font-bold text-lg hover:bg-[#D88C61] transition-all transform hover:scale-105 shadow-lg shadow-[#E89D71]/20"
            >
              Get Started
            </Link>
            <Link 
              href="/about"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#4A3728] border-2 border-zinc-100 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Featured Events Section */}
        <div className="max-w-6xl w-full space-y-8 mt-20 text-left">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-[#2D1E17]">Upcoming Community Events</h2>
              <p className="text-[#6B5A4E]">See what's happening soon in our community.</p>
            </div>
            <Link href={getStartedHref} className="text-[#E89D71] font-bold hover:underline hidden md:block">
              View all events →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event: any) => (
              <Link key={event.id} href={getStartedHref}>
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-[#E89D71]/20 transition-all group flex flex-col h-full">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 bg-[#FEF3EB] rounded-full text-[10px] font-bold text-[#E89D71] uppercase tracking-wider">
                        {format(new Date(event.start_time), 'MMM dd')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-[#6B5A4E]">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-zinc-300" />
                        <span>{format(new Date(event.start_time), 'EEEE, HH:mm')}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between text-[#E89D71] font-bold text-sm">
                    <span>Sign up to join</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center md:hidden pt-4">
            <Link href={getStartedHref} className="text-[#E89D71] font-bold hover:underline">
              View all events →
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-zinc-100 text-center text-sm text-[#6B5A4E]">
        © {new Date().getFullYear()} Careable. Built with love for the community.
      </footer>
    </div>
  );
}
