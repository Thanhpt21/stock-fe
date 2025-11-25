'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');


  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAdminPage && <Header />}
        
        <main className="flex justify-center flex-grow">
          {children}
        </main>

        {!isAdminPage && <Footer />}
      </div>
    </AuthProvider>
  );
}
