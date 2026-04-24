'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, RefreshCw, GraduationCap, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getBookings, getSchools, type Booking, type School } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRIP_TYPE_LABELS: Record<string, string> = {
  ONE_WAY_TO_SCHOOL: '→ To School',
  ONE_WAY_FROM_SCHOOL: '← From School',
};

function getBookingSchoolName(b: Booking): string {
  if (b.type === 'STUDENT_TRIP') return b.student?.school?.name ?? '—';
  return b.parentVisit?.school?.name ?? '—';
}

function getBookingPersonName(b: Booking): string {
  if (b.type === 'STUDENT_TRIP') return b.student?.studentName ?? '—';
  return b.parentVisit?.parentName ?? '—';
}

function StatusBadge({ status }: { status: Booking['paymentStatus'] }) {
  switch (status) {
    case 'SUCCESS':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>;
    case 'PENDING':
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">Pending</Badge>;
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GOING_TO_SCHOOL' | 'COMING_HOME' | 'PARENT_VISIT'>('ALL');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, sData] = await Promise.all([getBookings(), getSchools()]);
      setBookings(bData);
      setSchools(sData);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load bookings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Filtered + searched bookings ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      // Type filter
      if (typeFilter === 'GOING_TO_SCHOOL') {
        if (b.type !== 'STUDENT_TRIP' || b.tripType !== 'ONE_WAY_TO_SCHOOL') return false;
      } else if (typeFilter === 'COMING_HOME') {
        if (b.type !== 'STUDENT_TRIP' || b.tripType !== 'ONE_WAY_FROM_SCHOOL') return false;
      } else if (typeFilter !== 'ALL' && b.type !== typeFilter) {
        return false;
      }

      // School filter
      if (schoolFilter !== 'ALL' && getBookingSchoolName(b) !== schools.find(s => s.id === schoolFilter)?.name) return false;

      // Search
      if (!q) return true;
      const school = getBookingSchoolName(b).toLowerCase();
      const person = getBookingPersonName(b).toLowerCase();
      const route = (b.route?.name ?? '').toLowerCase();
      const ref = (b.paymentReference ?? '').toLowerCase();
      const stop = (b.stopName ?? b.customDropoff ?? '').toLowerCase();

      if (b.type === 'STUDENT_TRIP' && b.student) {
        return (
          person.includes(q) ||
          b.student.class.toLowerCase().includes(q) ||
          b.student.house.name.toLowerCase().includes(q) ||
          school.includes(q) ||
          route.includes(q) ||
          stop.includes(q) ||
          ref.includes(q)
        );
      } else if (b.type === 'PARENT_VISIT' && b.parentVisit) {
        return (
          person.includes(q) ||
          b.parentVisit.parentContact.toLowerCase().includes(q) ||
          school.includes(q) ||
          route.includes(q) ||
          stop.includes(q) ||
          ref.includes(q)
        );
      }
      return false;
    });
  }, [bookings, typeFilter, schoolFilter, searchQuery, schools]);



  return (
    <main className="container mx-auto px-4 py-10 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bookings</h1>
          <p className="text-gray-500">All registered student trips and parent visits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>


      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name, school, route, stop, or reference…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="GOING_TO_SCHOOL">
              <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-600" />Going to School</span>
            </SelectItem>
            <SelectItem value="COMING_HOME">
              <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-600" />Coming Home</span>
            </SelectItem>
            <SelectItem value="PARENT_VISIT">
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /> Parent Visit</span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* School filter */}
        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Schools</SelectItem>
            {schools.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of {bookings.length} bookings
      </p>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col h-64 items-center justify-center text-gray-400">
            <Search className="h-10 w-10 text-gray-300 mb-3" />
            <p className="font-medium">No bookings match your filters.</p>
            <button className="text-sm text-blue-500 mt-2 underline" onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setSchoolFilter('ALL'); }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Trip Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stop</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-gray-500 text-sm">
                      {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>

                    {/* Type badge */}
                    <TableCell>
                      {b.type === 'STUDENT_TRIP' ? (
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap">
                          <GraduationCap className="h-3 w-3 mr-1" /> Student
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 whitespace-nowrap">
                          <Users className="h-3 w-3 mr-1" /> Parent Visit
                        </Badge>
                      )}
                    </TableCell>

                    {/* Person name + contact */}
                    <TableCell>
                      <div className="font-medium text-gray-900">{getBookingPersonName(b)}</div>
                      <div className="text-xs text-gray-500">
                        Phone: {b.type === 'STUDENT_TRIP' ? b.student?.parentContact : b.parentVisit?.parentContact}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Whatsapp: {b.type === 'STUDENT_TRIP' ? b.student?.whatsappContact : b.parentVisit?.whatsappContact}
                      </div>
                    </TableCell>



                    {/* Student-specific details */}
                    <TableCell>
                      {b.type === 'STUDENT_TRIP' && b.student ? (
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-gray-700">{b.student.class}</div>
                          <div className="text-xs text-gray-400">{b.student.house.name}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </TableCell>

                    {/* Trip Type */}
                    <TableCell>
                      {b.tripType ? (
                        <Badge variant="outline" className={
                          b.tripType === 'ONE_WAY_TO_SCHOOL' ? 'border-green-200 text-green-700 bg-green-50 text-xs' :
                            'border-amber-200 text-amber-700 bg-amber-50 text-xs'
                        }>{TRIP_TYPE_LABELS[b.tripType]}</Badge>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </TableCell>

                    {/* Stop */}
                    <TableCell className="max-w-[180px]">
                      {b.customDropoff ? (
                        <div>
                          <div className="text-xs text-gray-700 truncate">{b.customDropoff}</div>
                          <div className="text-[10px] text-gray-400">Custom</div>
                        </div>
                      ) : b.stopName ? (
                        <div className="text-xs text-gray-700 truncate">{b.stopName}</div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(b.price)}
                    </TableCell>

                    {/* Status */}
                    <TableCell><StatusBadge status={b.paymentStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
