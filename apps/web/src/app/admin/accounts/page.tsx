'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2, Trash2, Shield, UserPlus, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listAdmins, createAdmin, deleteAdmin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']),
});

export default function AccountsPage() {
  const router = useRouter();
  const { admin } = useAuth();
  const { toast } = useToast();

  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'ADMIN' },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch {
      toast({ variant: 'destructive', title: 'Error loading admin accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin && admin.role !== 'SUPER_ADMIN') {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Only Super Admins can access this page.' });
      router.push('/admin');
    } else if (admin) {
      loadData();
    }
  }, [admin, router, toast]);

  const onSubmit = async (values: z.infer<typeof createSchema>) => {
    setIsSubmitting(true);
    try {
      await createAdmin(values);
      toast({ title: 'Success', description: 'Admin account created successfully' });
      setIsOpen(false);
      form.reset();
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create admin',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access for ${name}?`)) {
      try {
        await deleteAdmin(id);
        toast({ title: 'Success', description: 'Admin account removed.' });
        loadData();
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.response?.data?.message || 'Failed to delete admin',
        });
      }
    }
  };

  if (!admin || admin.role !== 'SUPER_ADMIN') return null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-gray-500">Manage dashboard access and privileges.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Active Accounts ({admins.length})</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="w-4 h-4 mr-2" /> Add Admin</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Admin Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="john@trip.com" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    onValueChange={(val) => form.setValue('role', val as any)}
                    defaultValue={form.getValues('role')}
                  >
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrator (Standard)</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Temporary Password</Label>
                  <Input type="password" placeholder="••••••••" {...form.register('password')} />
                  {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead>User Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{acc.name}</div>
                    <div className="text-xs text-gray-500">{acc.email}</div>
                  </TableCell>
                  <TableCell>
                    {acc.role === 'SUPER_ADMIN' ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                        <Shield className="w-3 h-3 mr-1" /> Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Administrator
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(acc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={acc.id === admin.id}
                      onClick={() => handleDelete(acc.id, acc.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
