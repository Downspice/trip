'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Loader2, Search, RefreshCw, GraduationCap, Users,
  TrendingUp, CheckCircle2, Clock, XCircle, ArrowLeft, Settings2,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { getBookings, getSchools, clearAllBookings, type Booking, type School } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';


// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRIP_TYPE_LABELS: Record<string, string> = {
  ONE_WAY_TO_SCHOOL: '→ To School',
  ONE_WAY_FROM_SCHOOL: '← From School',
};

function getSchoolName(b: Booking) {
  return b.type === 'STUDENT_TRIP' ? b.student?.school?.name ?? '—' : b.parentVisit?.school?.name ?? '—';
}

function getPersonName(b: Booking) {
  return b.type === 'STUDENT_TRIP' ? b.student?.studentName ?? '—' : b.parentVisit?.parentName ?? '—';
}

function StatusBadge({ status }: { status: Booking['paymentStatus'] }) {
  switch (status) {
    case 'SUCCESS':  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>;
    case 'PENDING':  return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">Pending</Badge>;
    case 'FAILED':   return <Badge variant="destructive">Failed</Badge>;
    default:         return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconClass, borderClass,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconClass: string; borderClass: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${borderClass} shadow-sm p-5 flex items-start gap-4`}>
      <div className={`p-2.5 rounded-xl ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── School breakdown row ─────────────────────────────────────────────────────

function SchoolBreakdown({ bookings, schools }: { bookings: Booking[]; schools: School[] }) {
  const rows = useMemo(() => {
    return schools.map((s) => {
      const mine = bookings.filter(b => getSchoolName(b) === s.name);
      const paid = mine.filter(b => b.paymentStatus === 'SUCCESS');
      return {
        name: s.name,
        total: mine.length,
        students: mine.filter(b => b.type === 'STUDENT_TRIP').length,
        parents: mine.filter(b => b.type === 'PARENT_VISIT').length,
        paid: paid.length,
        revenue: paid.reduce((sum, b) => sum + b.price, 0),
      };
    }).filter(r => r.total > 0);
  }, [bookings, schools]);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b bg-gray-50/70">
        <h2 className="font-bold text-gray-800">Breakdown by School</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>School</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-center">Parents</TableHead>
              <TableHead className="text-center">Paid</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.name}>
                <TableCell className="font-semibold text-gray-800">{r.name}</TableCell>
                <TableCell className="text-center text-gray-700">{r.total}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">{r.students}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">{r.parents}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{r.paid}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(r.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'STUDENT_TRIP' | 'PARENT_VISIT'>('ALL');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');

  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, sData] = await Promise.all([getBookings(), getSchools()]);
      setBookings(bData);
      setSchools(sData);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllBookings();
      toast({ title: 'Bookings Cleared', description: 'All bookings and trips have been deleted.' });
      setClearOpen(false);
      loadData();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to clear bookings.' });
    } finally {
      setClearing(false);
    }
  };

  // ─── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paid = bookings.filter(b => b.paymentStatus === 'SUCCESS');
    return {
      total: bookings.length,
      students: bookings.filter(b => b.type === 'STUDENT_TRIP').length,
      parents: bookings.filter(b => b.type === 'PARENT_VISIT').length,
      paid: paid.length,
      pending: bookings.filter(b => b.paymentStatus === 'PENDING').length,
      failed: bookings.filter(b => b.paymentStatus === 'FAILED').length,
      revenue: paid.reduce((s, b) => s + b.price, 0),
    };
  }, [bookings]);

  // ─── Filtered list ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      if (typeFilter === 'GOING_TO_SCHOOL') {
        if (b.type !== 'STUDENT_TRIP' || b.tripType !== 'ONE_WAY_TO_SCHOOL') return false;
      } else if (typeFilter === 'COMING_HOME') {
        if (b.type !== 'STUDENT_TRIP' || b.tripType !== 'ONE_WAY_FROM_SCHOOL') return false;
      } else if (typeFilter !== 'ALL' && b.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && b.paymentStatus !== statusFilter) return false;
      if (schoolFilter !== 'ALL' && getSchoolName(b) !== schools.find(s => s.id === schoolFilter)?.name) return false;
      if (!q) return true;
      const terms = [
        getPersonName(b), getSchoolName(b), b.route?.name ?? '',
        b.paymentReference ?? '', b.stopName ?? '', b.customDropoff ?? '',
        b.student?.class ?? '', b.student?.house?.name ?? '',
        b.student?.programme?.name ?? '', b.parentVisit?.parentContact ?? '',
      ];
      return terms.some(t => t.toLowerCase().includes(q));
    });
  }, [bookings, typeFilter, statusFilter, schoolFilter, searchQuery, schools]);

  // download excel
  const handleDownloadExcel = () => {
  if (filtered.length === 0) {
    toast({ title: 'No bookings to download', description: 'The current filter returned no results.' });
    return;
  }

  const rows = filtered.map((b) => {
    const isStudent = b.type === 'STUDENT_TRIP';
    const tripType = b.tripType === 'ONE_WAY_TO_SCHOOL'
      ? 'Going to School'
      : b.tripType === 'ONE_WAY_FROM_SCHOOL'
        ? 'Coming Home'
        : 'Parent Visit';
    
    const details = isStudent
      ? [b.student?.class, b.student?.house?.name, b.student?.programme?.name].filter(Boolean).join(' · ')
      : '';
    
    return {
      Date: new Date(b.createdAt).toLocaleDateString('en-GB'),
      Type: isStudent ? 'Student' : 'Parent Visit',
      Name: getPersonName(b),
      Phone: isStudent ? (b.student?.parentContact ?? '') : (b.parentVisit?.parentContact ?? ''),
      School: getSchoolName(b),
      Details: details,
      Route: b.route?.name ?? '',
      'Trip Type': tripType,
      Stop: b.stopName ?? b.customDropoff ?? '',
      Amount: b.price ? formatCurrency(b.price) : '',
      Status: b.paymentStatus ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
  
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `bookings-${today}.xlsx`);
  
  toast({ title: 'Download started', description: `Exported ${filtered.length} booking(s).` });
};

  return (
    <main className="container mx-auto px-4 py-10 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Panel
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Live overview of all bookings and payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={clearOpen} onOpenChange={setClearOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200">
                <XCircle className="mr-2 h-4 w-4" /> Clear All Bookings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Clear All Bookings?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete <b>every student trip and parent visit</b> from the database.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setClearOpen(false)} disabled={clearing}>Cancel</Button>
                <Button variant="destructive" onClick={handleClearAll} disabled={clearing}>
                  {clearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, Delete Everything
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/config')}>
            <Settings2 className="mr-2 h-4 w-4" /> Config
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="col-span-2 md:col-span-4 lg:col-span-2">
          <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} sub={`${stats.paid} paid bookings`} icon={TrendingUp} iconClass="bg-emerald-100 text-emerald-700" borderClass="border-emerald-400" />
        </div>
        <StatCard label="Total Bookings" value={stats.total} icon={TrendingUp} iconClass="bg-gray-100 text-gray-600" borderClass="border-gray-300" />
        <StatCard label="Student Trips" value={stats.students} icon={GraduationCap} iconClass="bg-blue-100 text-blue-700" borderClass="border-blue-400" />
        <StatCard label="Parent Visits" value={stats.parents} icon={Users} iconClass="bg-purple-100 text-purple-700" borderClass="border-purple-400" />
        <StatCard label="Paid" value={stats.paid} icon={CheckCircle2} iconClass="bg-green-100 text-green-700" borderClass="border-green-400" />
        <StatCard label="Pending" value={stats.pending} sub={stats.failed > 0 ? `${stats.failed} failed` : undefined} icon={Clock} iconClass="bg-yellow-100 text-yellow-700" borderClass="border-yellow-400" />
      </div>

      {/* School breakdown table */}
      {!loading && <SchoolBreakdown bookings={bookings} schools={schools} />}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search name, school, route, stop, or reference…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="GOING_TO_SCHOOL">Going to School</SelectItem>
            <SelectItem value="COMING_HOME">Coming Home</SelectItem>
            <SelectItem value="PARENT_VISIT">Parent Visit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="All Schools" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Schools</SelectItem>
            {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleDownloadExcel} 
          variant="outline" 
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </Button>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of {bookings.length} bookings
      </p>

      {/* Bookings table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col h-64 items-center justify-center text-gray-400">
            <Search className="h-10 w-10 text-gray-300 mb-3" />
            <p className="font-medium">No bookings match your filters.</p>
            <button className="text-sm text-blue-500 mt-2 underline" onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setSchoolFilter('ALL'); setStatusFilter('ALL'); }}>
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
                  <TableHead className="font-semibold text-gray-700">School</TableHead>
                  <TableHead className="font-semibold text-gray-700">Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Route</TableHead>
                  <TableHead className="font-semibold text-gray-700">Trip Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stop</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <TableCell className="whitespace-nowrap text-gray-500 text-sm">
                      {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      {b.type === 'STUDENT_TRIP'
                        ? <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap"><GraduationCap className="h-3 w-3 mr-1" />Student</Badge>
                        : <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 whitespace-nowrap"><Users className="h-3 w-3 mr-1" />Parent Visit</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{getPersonName(b)}</div>
                      <div className="text-xs text-gray-400">{b.type === 'STUDENT_TRIP' ? b.student?.parentContact : b.parentVisit?.parentContact}</div>
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium text-sm">{getSchoolName(b)}</TableCell>
                    <TableCell>
                      {b.type === 'STUDENT_TRIP' && b.student ? (
                        <div>
                          <div className="text-xs font-medium text-gray-700">{b.student.class}</div>
                          <div className="text-xs text-gray-400">{b.student.house.name} · {b.student.programme.name}</div>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-800 font-medium">{b.route?.name ?? <span className="text-gray-400">—</span>}</div>
                      <div className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{b.paymentReference ?? 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      {b.tripType ? (
                        <Badge variant="outline" className={
                          b.tripType === 'ONE_WAY_TO_SCHOOL' ? 'border-green-200 text-green-700 bg-green-50 text-xs' :
                          'border-amber-200 text-amber-700 bg-amber-50 text-xs'
                        }>{TRIP_TYPE_LABELS[b.tripType]}</Badge>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      {b.customDropoff
                        ? <div><div className="text-xs text-gray-700 truncate">{b.customDropoff}</div><div className="text-[10px] text-gray-400">Custom</div></div>
                        : b.stopName
                        ? <div className="text-xs text-gray-700 truncate">{b.stopName}</div>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(b.price)}</TableCell>
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
