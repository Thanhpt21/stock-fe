// src/app/admin/categories/page.tsx
'use client'

import CategoryTable from '@/components/admin/category/CategoryTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminCategoryPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý danh mục</Title>
      <CategoryTable />
    </div>
  )
}