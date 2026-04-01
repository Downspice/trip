import type { Metadata } from 'next';
import './globals.css';
import { Nunito } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import { cn } from "@/lib/utils";

const nunito = Nunito({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'School Trip Booking',
  description: 'Book your school trip quickly and securely',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
