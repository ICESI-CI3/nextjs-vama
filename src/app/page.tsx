'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardRoute } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirigir según el rol del usuario
        router.push(getDashboardRoute(user));
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <p>Cargando...</p>
    </div>
  );
}

