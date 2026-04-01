import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailedPage() {
  return (
    <main className="container mx-auto px-4 py-24 max-w-md text-center">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Payment Failed</CardTitle>
          <CardDescription>
            Your payment could not be processed. Please try again or contact your bank.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/booking">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
