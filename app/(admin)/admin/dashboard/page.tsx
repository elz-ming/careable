import {
  getAttendanceMetrics,
  getEventHotspots,
  getPlatformStats,
  getCaregiverStats,
} from '@/lib/analytics/queries';
import { Card } from '@/components/ui/card';
import { ParticipantEngagementChart } from './ParticipantEngagementChart';
import {
  Users,
  Calendar,
  TrendingUp,
  Heart,
  MapPin,
  BarChart3,
  Info,
} from 'lucide-react';

/** Bucket event attendance into up to 12 weeks (most recent first). Returns array of { weekLabel, registered, active }. */
function bucketEventsByWeek(events: { start_time: string; total_registrations: number; total_attended: number }[]): { weekLabel: string; registered: number; active: number }[] {
  if (!events?.length) return [];
  const weekMap = new Map<string, { registered: number; active: number }>();
  for (const e of events) {
    const d = new Date(e.start_time);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().slice(0, 10);
    const cur = weekMap.get(key) ?? { registered: 0, active: 0 };
    cur.registered += e.total_registrations;
    cur.active += e.total_attended;
    weekMap.set(key, cur);
  }
  const sorted = Array.from(weekMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12);
  return sorted.map(([key], i) => ({
    weekLabel: `Wk ${i + 1}`,
    registered: weekMap.get(key)!.registered,
    active: weekMap.get(key)!.active,
  }));
}

export default async function AdminDashboard() {
  const [
    metricsRes,
    hotspotsRes,
    platformRes,
    caregiverRes,
  ] = await Promise.all([
    getAttendanceMetrics(),
    getEventHotspots(),
    getPlatformStats(),
    getCaregiverStats(),
  ]);

  const metrics = metricsRes.success ? metricsRes.data : null;
  const hotspots = hotspotsRes.success ? hotspotsRes.data : [];
  const platformStats = platformRes.success ? platformRes.data : null;
  const caregiverStats = caregiverRes.success ? caregiverRes.data : null;

  const activeParticipants =
    platformStats?.userCounts?.participant ?? 0;
  const totalUsers = platformStats?.totalUsers ?? 0;
  const attendanceRate = platformStats?.overallAttendanceRate ?? 0;
  const staffCount = platformStats?.userCounts?.staff ?? 0;
  const participantCount = platformStats?.userCounts?.participant ?? 0;
  const activeEvents = platformStats?.activeEvents ?? 0;
  const staffCapacityProxy =
    staffCount > 0
      ? Math.round(participantCount / staffCount)
      : activeEvents;

  const weeklyEngagement = metrics?.events
    ? bucketEventsByWeek(metrics.events)
    : [];
  const hasTrendData = weeklyEngagement.length > 0;

  const topHotspots = hotspots.slice(0, 6);
  const maxHotspotCount =
    topHotspots.length > 0
      ? Math.max(...topHotspots.map((h) => h.eventCount), 1)
      : 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1E17]">
            Programme Director&apos;s Dashboard
          </h1>
          <p className="text-[#6B5A4E] mt-2">
            High-level view of participant engagement, staff capacity, and
            programme reach across the STEP community.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2">
            <span className="text-sm text-[#6B5A4E]">Reporting period:</span>
            <select
              className="text-sm font-medium text-[#2D1E17] bg-transparent border-0 cursor-pointer focus:ring-0"
              aria-label="Reporting period"
            >
              <option>Last 90 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <p className="text-xs text-[#6B5A4E] flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Period filters will be enabled in a future update.
          </p>
        </div>
      </div>

      {/* Top KPI cards (3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">
                Active Participants
              </div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">
                {activeParticipants}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                Out of {totalUsers} total users
                {platformStats?.userCounts && (
                  <> • {platformStats.userCounts.volunteer ?? 0} volunteers</>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-[#FEF3EB] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#E89D71]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">
                Avg. Attendance Rate
              </div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">
                {attendanceRate}%
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                Overall platform average
              </div>
            </div>
            <div className="w-12 h-12 bg-[#E8F3F0] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#86B1A4]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">
                Staff Capacity (Proxy)
              </div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">
                {staffCapacityProxy}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                {staffCount > 0
                  ? 'Participants per staff member'
                  : 'Active events (capacity proxy)'}
              </div>
            </div>
            <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#86B1A4]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Caregiver Program */}
      {caregiverStats && (
        <Card className="p-6 rounded-2xl bg-gradient-to-br from-[#FEF3EB] to-white border border-[#E89D71]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#E89D71] rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2D1E17]">
              Caregiver Program
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-[#6B5A4E]">Active Caregivers</div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">
                {caregiverStats.totalCaregivers}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#6B5A4E]">
                Managed Participants
              </div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">
                {caregiverStats.totalRelationships}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#6B5A4E]">
                Caregiver Registrations
              </div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">
                {caregiverStats.caregiverRegistrations}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Participant Engagement Trend */}
      <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-bold text-[#2D1E17]">
          Participant Engagement Trend
        </h2>
        <p className="text-sm text-[#6B5A4E] mt-1">
          Weekly view of registered vs active engagement.
        </p>
        <div className="mt-4">
          {hasTrendData ? (
            <ParticipantEngagementChart data={weeklyEngagement} />
          ) : (
            <>
              <p className="text-sm text-[#6B5A4E] py-2">
                Trend data not available from current backend response.
              </p>
              <div className="mt-3 rounded-lg bg-zinc-50 border border-zinc-100 p-4">
                <p className="text-xs text-[#6B5A4E] uppercase tracking-wide mb-2">
                  Summary (totals)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-[#6B5A4E]">Total users: </span>
                    <span className="font-semibold text-[#2D1E17]">
                      {platformStats?.totalUsers ?? '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B5A4E]">Total check-ins: </span>
                    <span className="font-semibold text-[#2D1E17]">
                      {platformStats?.totalCheckIns ?? '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B5A4E]">Total registrations: </span>
                    <span className="font-semibold text-[#2D1E17]">
                      {platformStats?.totalRegistrations ?? '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B5A4E]">Attendance rate: </span>
                    <span className="font-semibold text-[#2D1E17]">
                      {platformStats?.overallAttendanceRate ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Secondary charts row: Geographic Reach + Event Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[#86B1A4]" />
            <h2 className="text-xl font-bold text-[#2D1E17]">
              Geographic Reach
            </h2>
          </div>
          <p className="text-sm text-[#6B5A4E] mb-4">
            Proxy based on popular venues (top locations by event count).
          </p>
          {topHotspots.length > 0 ? (
            <div className="space-y-3">
              {topHotspots.map((spot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="h-7 rounded bg-[#E8F3F0] min-w-[4px] flex-1 max-w-[240px]"
                    style={{
                      width: `${Math.min(
                        100,
                        (spot.eventCount / maxHotspotCount) * 100
                      )}%`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[#2D1E17] truncate block">
                      {spot.location}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#86B1A4] tabular-nums shrink-0">
                    {spot.eventCount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B5A4E]">
              No venue data available.
            </p>
          )}
        </Card>

        <Card className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#E89D71]" />
            <h2 className="text-xl font-bold text-[#2D1E17]">
              Event Performance
            </h2>
          </div>
          <p className="text-sm text-[#6B5A4E] mb-4">
            Platform totals (performance scoreboard).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-100 p-3">
              <div className="text-xs text-[#6B5A4E] uppercase tracking-wide">
                Total Events
              </div>
              <div className="text-2xl font-bold text-[#2D1E17] mt-1">
                {platformStats?.totalEvents ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-100 p-3">
              <div className="text-xs text-[#6B5A4E] uppercase tracking-wide">
                Active Events
              </div>
              <div className="text-2xl font-bold text-[#86B1A4] mt-1">
                {platformStats?.activeEvents ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-100 p-3">
              <div className="text-xs text-[#6B5A4E] uppercase tracking-wide">
                Total Check-ins
              </div>
              <div className="text-2xl font-bold text-[#2D1E17] mt-1">
                {platformStats?.totalCheckIns ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-100 p-3">
              <div className="text-xs text-[#6B5A4E] uppercase tracking-wide">
                Total Registrations
              </div>
              <div className="text-2xl font-bold text-[#E89D71] mt-1">
                {platformStats?.totalRegistrations ?? '—'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
