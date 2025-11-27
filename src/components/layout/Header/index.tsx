// components/layout/Header.tsx - Updated
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import MainMenu from './MainMenu';
import AuthMenu from './AuthMenu';
import UserMenu from './UserMenu';
import { AccountSelector } from '@/components/trading/AccountSelector';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isTradingPage = pathname?.startsWith('/trading');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg border-b border-gray-200' : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <MainMenu pathname={pathname} />

          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Trading Account Selector - Only show on trading pages */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : currentUser ? (
              <>
                <AuthMenu />
                <UserMenu />
              </>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => router.push('/register')}
                  className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;