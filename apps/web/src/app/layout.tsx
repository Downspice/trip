import type { Metadata } from 'next';
import './globals.css';
import { Nunito } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import { cn } from "@/lib/utils";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: 'School Trip Booking',
  description: 'Book your school trip quickly and securely',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(nunito.variable, "font-sans antialiased")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
