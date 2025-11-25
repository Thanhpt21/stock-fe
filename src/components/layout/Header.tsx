'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BarChartOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HeartOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  config?: {
    logo?: string;
    name?: string;
  };
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useAuth(); // Sử dụng AuthContext
  
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng user menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowUserMenu(false);
    router.refresh(); // Refresh để cập nhật state
    router.push('/');
  };

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  // Menu items chính
  const mainMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thị trường', href: '/stocks' },
    { label: 'Bảng giá', href: '/quotes' },
    { label: 'Phân tích', href: '/analysis' },
    { label: 'Tin tức', href: '/news' },
  ];

  // Menu items khi đã đăng nhập
  const authenticatedMenuItems = [
 
    { label: 'Giao dịch', href: '/trading', icon: <ThunderboltOutlined /> },
  ];

  // User menu items
  const userMenuItems = [
       { label: 'Watchlist', href: '/watchlist', icon: <HeartOutlined /> },
    { label: 'Hồ sơ', href: '/profile', icon: <UserOutlined /> },
    { label: 'Cài đặt', href: '/settings', icon: <SettingOutlined /> },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <BarChartOutlined className="text-white text-lg" />
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-900 font-bold text-xl">StockPro</span>
                <span className="block text-blue-600 text-xs font-medium">TÀI CHÍNH & ĐẦU TƯ</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2 text-[15px] font-medium rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Hiển thị menu đặc biệt khi đã đăng nhập */}
            {currentUser && authenticatedMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2 text-[15px] font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {isLoading ? (
              // Loading state
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : currentUser ? (
              // Đã đăng nhập - Hiển thị user menu
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleUserMenuClick}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserOutlined className="text-white text-sm" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {currentUser.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                    
                    {/* Menu Items */}
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogoutOutlined />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Chưa đăng nhập - Hiển thị nút đăng nhập/đăng ký
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;