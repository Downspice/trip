'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft, Wallet, Building, ArrowUpRight, ArrowDownRight, CheckCircle2,
  Clock, XCircle, RefreshCw, Loader2, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getPaystackBalance, getTransfers, getBanks, initiateWithdrawal,
  type PaystackBalance, type PaystackTransfer, type PaystackBank,
} from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function AdminFinancesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [balance, setBalance] = useState<PaystackBalance[]>([]);
  const [transfers, setTransfers] = useState<PaystackTransfer[]>([]);
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [wAmount, setWAmount] = useState('');
  const [wAccountName, setWAccountName] = useState('');
  const [wAccountNumber, setWAccountNumber] = useState('');
  const [wMethod, setWMethod] = useState<'bank' | 'momo' | ''>('');
  const [wBankCode, setWBankCode] = useState('');
  const [wReason, setWReason] = useState('School trip fund withdrawal');

  const loadData = async () => {
    setLoading(true);
    try {
      const [balData, transData, bankData] = await Promise.all([
        getPaystackBalance(),
        getTransfers(),
        getBanks(),
      ]);
      setBalance(balData);
      setTransfers(transData as any); // cast safely based on Paystack response shape
      setBanks(bankData);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load financial data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wAmount || !wAccountName || !wAccountNumber || !wBankCode) return;
    
    const amount = parseFloat(wAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid amount to withdraw.' });
      return;
    }

    setWithdrawing(true);
    try {
      await initiateWithdrawal({
        amount,
        accountName: wAccountName,
        accountNumber: wAccountNumber,
        bankCode: wBankCode,
        reason: wReason,
      });
      toast({ title: 'Withdrawal Initiated', description: 'Your withdrawal is being processed.' });
      setWithdrawOpen(false);
      
      // Reset form
      setWAmount(''); setWAccountName(''); setWAccountNumber(''); setWBankCode(''); setWMethod('');
      
      // Reload balances & history
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Withdrawal Failed',
        description: error.response?.data?.message || 'Failed to process withdrawal.',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const ghsBalance = balance.find((b) => b.currency === 'GHS')?.balance ?? 0;
  // Paystack returns balance in kobo/pesewas, so divide by 100
  const availableGhs = ghsBalance / 100;

  // Filter banks into MomO and Normal Banks
  const momoKeywords = ['mtn', 'vodafone', 'airteltigo', 'telecel'];
  const momoNetworks = banks.filter(b => momoKeywords.some(k => b.name.toLowerCase().includes(k)));
  const normalBanks = banks.filter(b => !momoNetworks.includes(b));
  
  const displayedBanks = wMethod === 'momo' ? momoNetworks : normalBanks;

  return (
    <main className="container mx-auto px-4 py-10 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Panel
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finances</h1>
          <p className="text-gray-500 mt-1">Manage platform revenue and withdrawals.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-200 font-semibold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" /> Paystack Balance
            </p>
            <div className="flex items-end gap-3 mb-8">
              <h2 className="text-5xl font-black tracking-tighter">
                {loading ? '---' : formatCurrency(availableGhs)}
              </h2>
              <span className="text-indigo-200 text-lg mb-1 font-medium">Available</span>
            </div>

            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Download className="mr-2 h-5 w-5" /> Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Transfer funds from your Paystack balance to a bank account or mobile money wallet.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (GHS)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      max={availableGhs}
                      placeholder="e.g. 500"
                      value={wAmount}
                      onChange={(e) => setWAmount(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">Max available: {formatCurrency(availableGhs)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Withdrawal Method</Label>
                    <Select value={wMethod} onValueChange={(val: any) => { setWMethod(val); setWBankCode(''); }} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momo">Mobile Money</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {wMethod && (
                    <>
                      <div className="space-y-2">
                        <Label>{wMethod === 'momo' ? 'Mobile Network' : 'Destination Bank'}</Label>
                        <Select value={wBankCode} onValueChange={setWBankCode} required>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${wMethod === 'momo' ? 'network' : 'bank'}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {displayedBanks.map(b => (
                              <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{wMethod === 'momo' ? 'Mobile Money Number' : 'Account Number'}</Label>
                        <Input
                          placeholder={wMethod === 'momo' ? "e.g. 0241234567" : "e.g. 1234567890123"}
                          value={wAccountNumber}
                          onChange={(e) => setWAccountNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          placeholder="e.g. Jane Doe"
                          value={wAccountName}
                          onChange={(e) => setWAccountName(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={withdrawing}>
                    {withdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {withdrawing ? 'Processing...' : `Withdraw ${wAmount ? formatCurrency(parseFloat(wAmount) || 0) : ''}`}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border shadow-sm flex-1 flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
              <ArrowDownRight className="h-4 w-4 text-emerald-500" /> Total Received
            </p>
            <p className="text-2xl font-black text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-1">All successful payments</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border shadow-sm flex-1 flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-indigo-500" /> Total Withdrawn
            </p>
            <p className="text-2xl font-black text-gray-900">
              {loading ? '—' : formatCurrency(
                transfers
                  .filter((t: any) => t.status === 'success')
                  .reduce((sum, t: any) => sum + (t.amount / 100), 0)
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total transferred out</p>
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Withdrawal History</h2>
      
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="flex flex-col h-64 items-center justify-center text-gray-400">
            <Wallet className="h-10 w-10 text-gray-300 mb-3" />
            <p className="font-medium">No withdrawals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                  <TableHead className="font-semibold text-gray-700">Account</TableHead>
                  <TableHead className="font-semibold text-gray-700">Bank</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Fee</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transfers as any[]).map((t) => (
                  <TableRow key={t.id} className="hover:bg-gray-50/70">
                    <TableCell className="whitespace-nowrap text-gray-500 text-sm">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{t.reference}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{t.recipient?.name}</div>
                      <div className="text-xs text-gray-500">{t.recipient?.details?.account_number}</div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{t.recipient?.details?.bank_name}</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {formatCurrency(t.amount / 100)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {/* Paystack transfer fee is usually separate or in `fee` field */}
                      {t.fee ? formatCurrency(t.fee / 100) : '—'}
                    </TableCell>
                    <TableCell>
                      {t.status === 'success' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Success</Badge>
                      ) : t.status === 'pending' || t.status === 'processing' ? (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50"><Clock className="w-3 h-3 mr-1" /> {t.status}</Badge>
                      ) : (
                        <Badge variant="destructive" className="border-none"><XCircle className="w-3 h-3 mr-1" /> {t.status}</Badge>
                      )}
                    </TableCell>
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
