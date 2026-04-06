'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getProfile, adminLogout } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth on /admin routes
    if (!pathname?.startsWith('/admin')) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('No token');
        
        const profile = await getProfile();
        setAdmin(profile);
      } catch (err) {
        setAdmin(null);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = (token: string, user: AdminUser) => {
    localStorage.setItem('adminToken', token);
    setAdmin(user);
    router.push('/admin');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    router.push('/admin/login');
  };

  const isProtectedPath = pathname?.startsWith('/admin');

  if (loading && isProtectedPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prevent rendering protected pages if not logged in (unless it's the login page)
  if (!admin && !loading && isProtectedPath && pathname !== '/admin/login') {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
