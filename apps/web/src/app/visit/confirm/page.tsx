'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, MapPin, Building2, User } from 'lucide-react';

import { initializeVisitPayment, type BookingPreview, type VisitBookingFormData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function VisitConfirmPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [formData, setFormData] = useState<VisitBookingFormData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const previewData = sessionStorage.getItem('visitBookingPreview');
    const form = sessionStorage.getItem('visitBookingFormData');
    
    if (previewData && form) {
      setPreview(JSON.parse(previewData));
      setFormData(JSON.parse(form));
    } else {
      router.push('/visit');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const response = await initializeVisitPayment(formData);
      // Redirect to Paystack Checkout safely
      window.location.href = response.authorization_url;
    } catch (error: any) {
      toast({
        title: 'Payment Initialization Failed',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (!preview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-xl text-left">
      <Card className="shadow-lg border-t-4 border-t-purple-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Confirm Visit Details</CardTitle>
          <p className="text-gray-500 mt-2">Please verify the trip information below.</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4 border">
            <div className="flex items-start gap-4">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Parent Details</p>
                <p className="font-semibold text-gray-900">{preview.parentName}</p>
                <p className="text-sm text-gray-600">{preview.parentContact}</p>
                <p className="text-sm text-gray-600">{preview.email}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="font-semibold text-gray-900">{preview.school?.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-500">Route & Trip Type</p>
                <p className="font-semibold text-gray-900">{preview.route?.name ?? 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  {preview.tripType === 'ONE_WAY_TO_SCHOOL' ? 'One Way — To School'
                    : preview.tripType === 'ONE_WAY_FROM_SCHOOL' ? 'One Way — From School'
                    : ''}
                </p>
                {(preview.stopName || preview.customDropoff) && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    📍 {preview.customDropoff ?? preview.stopName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Total Amount</p>
              <p className="text-xs text-purple-700">Based on selected route & trip type</p>
            </div>
            <p className="text-3xl font-bold tracking-tight text-purple-700">
              {formatCurrency(preview.price)}
            </p>
          </div>
        </CardContent>


        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full h-14 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white" 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Initializing Payment...' : 'Confirm & Pay'}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500 hover:text-gray-900"
            onClick={() => router.back()}
            disabled={loading}
          >
            Edit Details
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
