'use client';

import { Image, Layout, Menu } from 'antd';
import { AppleOutlined, AppstoreOutlined, BgColorsOutlined, BookOutlined, BranchesOutlined, DashboardOutlined, FileProtectOutlined, GiftOutlined, GoldOutlined, HomeOutlined, MessageOutlined, PicLeftOutlined, PicRightOutlined, ProductOutlined, ScissorOutlined, SettingOutlined, SkinOutlined, SolutionOutlined, TruckOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface SidebarAdminProps {
  collapsed: boolean;
}

export default function SidebarAdmin({ collapsed }: SidebarAdminProps) {
  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow"
      style={{ backgroundColor: '#fff' }}
    >
      <div className=" text-center py-4">
        <Image
          src="https://www.sfdcpoint.com/wp-content/uploads/2019/01/Salesforce-Admin-Interview-questions.png"
          alt="Admin Logo"
          width={collapsed ? 40 : 80}
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          {
            key: '1',
            icon: <DashboardOutlined />,
            label: <Link href="/admin">Dashboard</Link>,
          },
          {
              key: '2',
              icon: <GoldOutlined />,
              label: <Link href="/admin/course">Khóa học</Link>,
            },

           
        
          {
            key: '3',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Tài khoản</Link>,
          },
          {
            key: '4',
            icon: <SettingOutlined />,
            label: <Link href="/admin/role">Vai trò</Link>,
          },
           {
            key: '5',
            icon: <FileProtectOutlined />,
            label: <Link href="/admin/permission">Quyền</Link>,
          },
             {
            key: '6',
            icon: <SolutionOutlined />,
            label: <Link href="/admin/promptAI">Kịch bản AI</Link>,
          },
          {
            key: 'sub4',
            icon: <BranchesOutlined />,
            label: 'Cấu hình',
            children: [
            {
              key: '22',
              icon: <GoldOutlined />,
              label: <Link href="/admin/category">Danh mục khóa học</Link>,
            },
            {
              key: '21',
              icon: <GoldOutlined />,
              label: <Link href="/admin/tag">Thẻ khóa học</Link>,
            },
            { key: '20', icon: <SettingOutlined />, label: <Link href="/admin/config">Cấu hình</Link> },
             
            ],
          },
        ]}
      />
    </Layout.Sider>
  );
}