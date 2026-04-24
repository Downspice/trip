import { AuthProvider } from '@/contexts/AuthContext';

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
