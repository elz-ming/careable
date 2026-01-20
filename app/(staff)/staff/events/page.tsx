export default function StaffEventsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D1E17]">Event Management</h2>
      <div className="bg-white p-8 rounded-3xl border border-zinc-100 text-center py-20">
        <p className="text-zinc-400 text-lg font-medium">No events created yet. Create your first event to get started!</p>
        <button className="mt-6 px-6 py-3 bg-[#E89D71] text-white rounded-xl font-bold hover:bg-[#D88C61] transition-colors">
          + Create New Event
        </button>
      </div>
    </div>
  );
}
