export default function StaffParticipantsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D1E17]">Participant Registry</h2>
      <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-50 bg-zinc-50/50">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">All Stakeholders</p>
        </div>
        <div className="p-20 text-center">
          <p className="text-zinc-400">Loading participant data...</p>
        </div>
      </div>
    </div>
  );
}
