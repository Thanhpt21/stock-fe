"use client";

import Link from "next/link";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Config } from "@/types/config.type";

interface FooterProps {
  config?: Config;
}

const Footer = ({ config }: FooterProps) => {
  const socialLinks = [
    {
      icon: <FacebookOutlined />,
      url: config?.facebook,
      label: "Facebook",
    },
    {
      icon: <TwitterOutlined />,
      url: config?.x,
      label: "Twitter",
    },
    {
      icon: <LinkedinOutlined />,
      url: config?.linkedin,
      label: "LinkedIn",
    },
  ].filter((link) => link.url);

  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Thị trường", href: "/stocks" },
    { label: "Tin tức", href: "/news" },
    { label: "Công cụ", href: "/tools" },
  ];

  const supportLinks = [
    { label: "Hướng dẫn đầu tư", href: "/investment-guide" },
    { label: "Câu hỏi thường gặp", href: "/faq" },
    { label: "Chính sách bảo mật", href: "/privacy" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">StockPro</h3>
                <p className="text-blue-300 text-sm">TÀI CHÍNH & ĐẦU TƯ</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Nền tảng chứng khoán thông minh, cung cấp dữ liệu thời gian thực và công cụ phân tích chuyên nghiệp.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <PhoneOutlined className="text-blue-400" />
                <span>{config?.mobile || "1800 1000"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <MailOutlined className="text-blue-400" />
                <span>{config?.email || "contact@stockpro.vn"}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 text-sm">
                <EnvironmentOutlined className="text-blue-400 mt-0.5" />
                <span>{config?.address || "Tòa nhà Bitexco, Quận 1, TP.HCM"}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Truy cập nhanh
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm block py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 mb-6">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm block py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-lg">{link.icon}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} StockPro. All rights reserved.
            </p>
            <div className="text-gray-400 text-sm">
              Dữ liệu từ HOSE, HNX, UPCOM
            </div>
          </div>

          {/* Risk Warning */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-200 text-xs text-center">
              ⚠️ CẢNH BÁO RỦI RO: Đầu tư chứng khoán tiềm ẩn nhiều rủi ro. 
              Quý nhà đầu tư nên tìm hiểu kỹ trước khi đưa ra quyết định.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;