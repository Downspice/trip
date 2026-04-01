import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  return (
    <main className="container mx-auto px-4 py-24 max-w-md text-center">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Booking Confirmed!</CardTitle>
          <CardDescription>
            Your trip payment was successful. You will receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
