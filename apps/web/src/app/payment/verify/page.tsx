'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { verifyPayment } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { VerifyPaymentResponse } from '@/lib/api';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [result, setResult] = useState<VerifyPaymentResponse | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment(reference)
      .then((data) => {
        setResult(data);
        setStatus(data.success ? 'success' : 'failed');
        if (data.success) {
          sessionStorage.removeItem('bookingFormData');
          sessionStorage.removeItem('bookingPreview');
          sessionStorage.removeItem('visitBookingFormData');
          sessionStorage.removeItem('visitBookingPreview');
        }
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="text-center py-24">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verifying Payment...</h2>
        <p className="text-gray-500">Please wait while we confirm your payment</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Payment Not Confirmed</h2>
        <p className="text-gray-500 mb-8">
          We could not verify your payment. If you were charged, please contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/booking')}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const booking = result?.booking;
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500">Your trip booking has been confirmed</p>
      </div>

      {booking && (
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.type === 'STUDENT_TRIP' && booking.student ? (
              <>
                <InfoRow label="Student Name" value={booking.student.studentName} />
                <Separator />
                <InfoRow label="Class" value={booking.student.class} />
                <Separator />
                <InfoRow label="House" value={booking.student.house.name} />
                <Separator />
                <InfoRow label="Parent Contact" value={booking.student.parentContact} />
              </>
            ) : booking.parentVisit ? (
              <>
                <InfoRow label="Parent Name" value={booking.parentVisit.parentName} />
                <Separator />
                <InfoRow label="Contact" value={booking.parentVisit.parentContact} />
                <Separator />
                <InfoRow label="Email" value={booking.parentVisit.email} />
              </>
            ) : null}
            <Separator />
            <InfoRow label="School" value={booking.student?.school?.name || booking.parentVisit?.school?.name || 'N/A'} />
            <Separator />
            {booking.route && (
              <>
                <InfoRow label="Route" value={booking.route.name} />
                <Separator />
                <InfoRow
                  label="Trip Type"
                  value={
                    booking.tripType === 'ONE_WAY_TO_SCHOOL' ? 'To School'
                    : booking.tripType === 'ONE_WAY_FROM_SCHOOL' ? 'From School'
                    : 'N/A'
                  }
                />
                <Separator />
              </>
            )}
            {(booking.stopName || booking.customDropoff) && (
              <>
                <InfoRow
                  label={booking.customDropoff ? 'Custom Drop-off' : 'Pickup / Drop-off Stop'}
                  value={booking.customDropoff ?? booking.stopName ?? 'N/A'}
                />
                <Separator />
              </>
            )}

            <div className="flex justify-between items-center py-3">
              <span className="font-semibold text-gray-900">Amount Paid</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(booking.price)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
          Back to Home
        </Button>
        <Button onClick={() => window.print()} className="flex-1">
          Print Receipt
        </Button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </main>
  );
}
