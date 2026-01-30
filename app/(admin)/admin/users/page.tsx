import {
  getTopStaff,
  getTopParticipants,
  getTopVolunteers,
} from '@/lib/analytics/queries';
import { Card } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export default async function AdminUsersPage() {
  const [staffRes, participantsRes, volunteersRes] = await Promise.all([
    getTopStaff(10),
    getTopParticipants(10),
    getTopVolunteers(10),
  ]);

  const topStaff = staffRes.success ? staffRes.data : [];
  const topParticipants = participantsRes.success ? participantsRes.data : [];
  const topVolunteers = volunteersRes.success ? volunteersRes.data : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D1E17]">Users</h1>
        <p className="text-[#6B5A4E] mt-2">
          User management and engagement leaderboards.
        </p>
      </div>

      {/* Leaderboards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#2D1E17]">Leaderboards</h2>

        {/* Top Staff Members */}
        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6B5A4E] rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2D1E17]">
              Top Staff Members
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">
                    Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">
                    Events Created
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">
                    Check-ins Performed
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">
                    Active Events
                  </th>
                </tr>
              </thead>
              <tbody>
                {topStaff.map((staff, idx) => (
                  <tr
                    key={staff.staff_id}
                    className="border-b border-zinc-50 hover:bg-[#FEF3EB] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 rounded-full bg-[#E89D71] text-white flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#2D1E17] font-medium">
                      {staff.staff_name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#2D1E17] font-semibold">
                      {staff.events_created}
                    </td>
                    <td className="py-3 px-4 text-right text-[#86B1A4] font-semibold">
                      {staff.check_ins_performed}
                    </td>
                    <td className="py-3 px-4 text-right text-[#E89D71] font-semibold">
                      {staff.active_events}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Participants & Top Volunteers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#2D1E17] mb-4">
              Top Participants
            </h2>
            <div className="space-y-2">
              {topParticipants.slice(0, 10).map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#FEF3EB] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E89D71] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[#2D1E17] truncate">
                        {user.full_name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-[#6B5A4E]">
                        {user.total_attended} attended • {user.total_registrations}{' '}
                        registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-[#E89D71]">
                      {user.attendance_rate_percent.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#2D1E17] mb-4">
              Top Volunteers
            </h2>
            <div className="space-y-2">
              {topVolunteers.slice(0, 10).map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#E8F3F0] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#86B1A4] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[#2D1E17] truncate">
                        {user.full_name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-[#6B5A4E]">
                        {user.total_attended} attended • {user.total_registrations}{' '}
                        registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-[#86B1A4]">
                      {user.attendance_rate_percent.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Placeholder for future user management content */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center py-20">
        <p className="text-zinc-400 text-lg">User Management Content</p>
      </div>
    </div>
  );
}
