// src/app/admin/tags/page.tsx
'use client'

import TagTable from '@/components/admin/tag/TagTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminTagPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý thẻ</Title>
      <TagTable />
    </div>
  )
}