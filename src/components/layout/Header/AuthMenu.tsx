'use client';

import Link from 'next/link';
import { ThunderboltOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const AuthMenu = () => {
  const { currentUser } = useAuth();

  const authenticatedMenuItems = [

    { label: 'Watchlist', href: '/watchlist', icon: <HeartOutlined /> },
  ];

  return (
    <>
      {currentUser && (
        <nav className="hidden lg:flex items-center space-x-1 ml-4">
          {authenticatedMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-6 py-2 text-[15px] font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default AuthMenu;
