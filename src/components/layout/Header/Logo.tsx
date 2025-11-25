'use client';

import Link from 'next/link';
import { BarChartOutlined } from '@ant-design/icons';

const Logo = () => {
  return (
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
  );
};

export default Logo;
