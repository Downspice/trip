'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, MapPin, BookOpen, Phone, Mail, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { initializePayment } from '@/lib/api';
import type { BookingPreview, BookingFormData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function ConfirmPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const storedPreview = sessionStorage.getItem('bookingPreview');
    const storedForm = sessionStorage.getItem('bookingFormData');

    if (!storedPreview || !storedForm) {
      router.replace('/booking');
      return;
    }

    setPreview(JSON.parse(storedPreview));
    setFormData(JSON.parse(storedForm));
  }, [router]);

  const handleConfirmAndPay = async () => {
    if (!formData) return;
    setPaying(true);
    try {
      const result = await initializePayment(formData);
      // Clear session storage
      sessionStorage.removeItem('bookingPreview');
      sessionStorage.removeItem('bookingFormData');
      // Redirect to Paystack
      window.location.href = result.authorization_url;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to initialize payment.';
      toast({ variant: 'destructive', title: 'Payment Error', description: message });
      setPaying(false);
    }
  };

  if (!preview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
        <p className="text-gray-500">Please review your details before payment</p>
      </div>

      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Student Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Student Name" value={preview.studentName || 'N/A'} />
          <Separator />
          <InfoRow label="Class" value={preview.class || 'N/A'} />
          <Separator />
          <InfoRow label="House" value={preview.house?.name || 'N/A'} />
          <Separator />
          <InfoRow label="Programme" value={preview.programme?.name || 'N/A'} />
          <Separator />
          <InfoRow label="Email" value={preview.email} />
          <Separator />
          <InfoRow label="Parent / Guardian" value={preview.parentName} />
          <Separator />
          <InfoRow label="Parent Contact" value={preview.parentContact} />
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 mb-6 bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Route & Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Route" value={preview.route?.name ?? 'N/A'} />
          <Separator />
          <InfoRow
            label="Trip Type"
            value={
              preview.tripType === 'ONE_WAY_TO_SCHOOL' ? 'To School'
              : preview.tripType === 'ONE_WAY_FROM_SCHOOL' ? 'From School'
              : 'N/A'
            }
          />
          <Separator />
          {(preview.stopName || preview.customDropoff) && (
            <>
              <InfoRow
                label={preview.customDropoff ? 'Custom Drop-off' : 'Pickup / Drop-off Stop'}
                value={preview.customDropoff ?? preview.stopName ?? 'N/A'}
              />
              <Separator />
            </>
          )}
          <div className="flex justify-between items-center py-3">
            <span className="text-base font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(preview.price)}
            </span>
          </div>
        </CardContent>
      </Card>


      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={handleConfirmAndPay} disabled={paying} className="w-full">
          {paying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to Payment...
            </>
          ) : (
            `Confirm & Pay ${formatCurrency(preview.price)}`
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={paying}
          className="w-full"
        >
          Go Back &amp; Edit
        </Button>
      </div>
    </main>
  );
}
