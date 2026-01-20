'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}

export default function EventReviewPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([
    { 
      id: 1, 
      name: "Beach Clean", 
      date: "2024-10-12", 
      time: "08:00", 
      location: "East Coast Park",
      description: "Join us for a morning beach cleanup"
    },
    { 
      id: 2, 
      name: "AGM", 
      date: "2024-10-15", 
      time: "19:00", 
      location: "Hall A",
      description: "Annual General Meeting - All members welcome"
    }
  ]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleInputChange = (id: number, field: keyof Event, value: string) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  const handleDelete = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleAddEvent = () => {
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent: Event = {
      id: newId,
      name: '',
      date: '',
      time: '',
      location: '',
      description: ''
    };
    setEvents([...events, newEvent]);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      const response = await fetch('/api/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page
        router.push('/staff/review/success');
      } else {
        alert('Failed to publish events: ' + data.message);
        setIsPublishing(false);
      }
    } catch (error) {
      console.error('Error publishing events:', error);
      alert('An error occurred while publishing events');
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Review & Publish Events</h1>
            <p className="mt-2 text-blue-100">Review and edit events before publishing them to the system</p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 bg-opacity-50 rounded-lg">
              <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white text-sm font-medium">Each event creates 2 signup forms: Volunteer & Participant</span>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No events to review</p>
                <button
                  onClick={handleAddEvent}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Event
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Event Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={event.name}
                            onChange={(e) => handleInputChange(event.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Event name"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={event.date}
                            onChange={(e) => handleInputChange(event.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="time"
                            value={event.time}
                            onChange={(e) => handleInputChange(event.id, 'time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={event.location}
                            onChange={(e) => handleInputChange(event.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Location"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={event.description || ''}
                            onChange={(e) => handleInputChange(event.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Brief description"
                            rows={2}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4 justify-between items-center">
              <button
                onClick={handleAddEvent}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                + Add New Event
              </button>

              <div className="flex flex-col items-end gap-2">
                {events.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {events.length} event{events.length !== 1 ? 's' : ''} = {events.length * 2} signup forms
                  </p>
                )}
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || events.length === 0}
                  className={`px-8 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isPublishing || events.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPublishing ? 'Publishing...' : `Publish ${events.length} Event${events.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
