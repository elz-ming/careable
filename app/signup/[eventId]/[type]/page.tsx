import SignupForm from '@/app/components/SignupForm';

// Mock event data (replace with actual database fetch later)
const mockEvents = [
  { 
    id: '1', 
    name: 'Beach Clean', 
    date: '2024-10-12', 
    time: '08:00', 
    location: 'East Coast Park',
    description: 'Join us for a morning beach cleanup to help preserve our beautiful coastline.',
  },
  { 
    id: '2', 
    name: 'AGM', 
    date: '2024-10-15', 
    time: '19:00', 
    location: 'Hall A',
    description: 'Annual General Meeting - All members are welcome to attend and participate.',
  },
];

async function getEvent(eventId: string) {
  // TODO: Replace with actual database fetch
  // const event = await prisma.event.findUnique({ where: { id: eventId } });
  
  // Mock fetch delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockEvents.find(event => event.id === eventId);
}

interface PageProps {
  params: Promise<{
    eventId: string;
    type: string;
  }>;
}

export default async function SignupPage({ params }: PageProps) {
  const { eventId, type } = await params;
  
  // Validate type parameter
  const validTypes = ['volunteer', 'participant'];
  const normalizedType = type.toLowerCase();
  
  if (!validTypes.includes(normalizedType)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Form Type</h1>
          <p className="text-gray-600">Please select either volunteer or participant signup.</p>
        </div>
      </div>
    );
  }

  const event = await getEvent(eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
  const otherType = normalizedType === 'volunteer' ? 'participant' : 'volunteer';
  const otherTypeCapitalized = otherType.charAt(0).toUpperCase() + otherType.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Event Details Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                normalizedType === 'volunteer' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {formType} Signup
              </span>
              <a
                href={`/signup/${eventId}/${otherType}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
              >
                Switch to {otherTypeCapitalized}
              </a>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="mt-1 text-lg text-gray-900">{event.time}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start md:col-span-2">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="mt-1 text-lg text-gray-900">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{formType} Signup Form</h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill out the form below to register as a {normalizedType} for this event
            </p>
          </div>
          <div className="px-8 py-6">
            <SignupForm eventType={formType} eventId={event.id} eventName={event.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
