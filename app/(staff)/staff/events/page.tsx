'use client'

import * as React from 'react'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { getEvents } from './_actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'

export default function EventsListPage() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [filterAccessible, setFilterAccessible] = React.useState<boolean | 'all'>( 'all')

  React.useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const result = await getEvents()
      if (result.success) {
        setEvents(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch events')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesAccessibility = 
        filterAccessible === 'all' || event.is_accessible === filterAccessible

      return matchesSearch && matchesAccessibility
    })
    .sort((a, b) => {
      const dateA = new Date(a.start_time).getTime()
      const dateB = new Date(b.start_time).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1E17]">Event Management</h1>
          <p className="text-[#6B5A4E]">View and manage all organization events.</p>
        </div>
        <Link href="/staff/events/new">
          <Button className="bg-[#E89D71] hover:bg-[#D88C61] text-white h-11 px-6 rounded-xl font-bold shadow-lg shadow-[#E89D71]/20 transition-all hover:scale-[1.02]">
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Toolbar: Search, Filters, Sort, View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 h-11 bg-white rounded-xl border-zinc-100 shadow-sm focus:ring-[#E89D71]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Sort Order Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-zinc-100 bg-white h-11"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="mr-2 h-4 w-4 text-[#E89D71]" />
              Date {sortOrder === 'asc' ? '(Oldest)' : '(Newest)'}
            </Button>

            {/* Accessibility Filter */}
            <div className="flex bg-white border border-zinc-100 rounded-xl p-1 h-11">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("rounded-lg px-3 h-full", filterAccessible === 'all' && "bg-zinc-100 text-[#2D1E17]")}
                onClick={() => setFilterAccessible('all')}
              >
                All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("rounded-lg px-3 h-full", filterAccessible === true && "bg-zinc-100 text-[#2D1E17]")}
                onClick={() => setFilterAccessible(true)}
              >
                ♿ Accessible
              </Button>
            </div>

            <div className="h-8 w-px bg-zinc-100 mx-1 hidden sm:block" />

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-zinc-100 rounded-xl p-1 h-11">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("rounded-lg px-3 h-full", viewMode === 'cards' && "bg-zinc-100 text-[#E89D71]")}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("rounded-lg px-3 h-full", viewMode === 'table' && "bg-zinc-100 text-[#E89D71]")}
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-[#E89D71]" />
            <p className="font-medium">Loading organization events...</p>
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          viewMode === 'cards' ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredAndSortedEvents.map((event) => (
                <Card key={event.id} className="group overflow-hidden rounded-3xl border-zinc-100 hover:border-[#E89D71]/30 hover:shadow-xl hover:shadow-[#E89D71]/5 transition-all duration-300 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-[#2D1E17] leading-tight group-hover:text-[#E89D71] transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-[#6B5A4E]">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(new Date(event.start_time), 'EEE, dd MMM yyyy')}
                        </CardDescription>
                      </div>
                      {event.is_accessible && (
                        <div className="bg-[#E8F3F0] text-[#86B1A4] p-1.5 rounded-lg shrink-0" title="Wheelchair Accessible">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 text-sm text-[#6B5A4E]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 italic border-t border-zinc-50 pt-3">
                        {event.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Table View */
            <Card className="rounded-3xl overflow-hidden border-zinc-100 shadow-sm animate-in fade-in duration-500 bg-white">
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[35%] font-bold">Event Name</TableHead>
                    <TableHead className="w-[20%] font-bold">Date</TableHead>
                    <TableHead className="w-[15%] font-bold">Time</TableHead>
                    <TableHead className="w-[30%] font-bold">Venue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-zinc-50/30 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#2D1E17] group-hover:text-[#E89D71] transition-colors">{event.title}</span>
                          {event.is_accessible && <span className="text-[10px] text-[#86B1A4] font-medium flex items-center gap-1">♿ Accessible</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#6B5A4E]">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-zinc-400" />
                          {format(new Date(event.start_time), 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#6B5A4E]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          {format(new Date(event.start_time), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#6B5A4E]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{event.location}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
            <div className="bg-zinc-50 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">{searchQuery ? "Try adjusting your search or filters." : "Click 'Create Event' to add your first event."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
