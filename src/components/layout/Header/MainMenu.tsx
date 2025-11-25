'use client';

import Link from 'next/link';

interface MainMenuProps {
  pathname: string;
}

const MainMenu = ({ pathname }: MainMenuProps) => {
  const mainMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thị trường', href: '/stocks' },
    { label: 'Bảng giá', href: '/quotes' },
    { label: 'Phân tích', href: '/analysis' },
    { label: 'Tin tức', href: '/news' },
  ];

  return (
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
    </nav>
  );
};

export default MainMenu;
