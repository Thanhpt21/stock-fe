'use client'

import CourseTable from '@/components/admin/course/CourseTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminCoursePage() {
  return (
    <div className="p-4">
      <Title level={4} className="!mb-4">Quản lý Khóa học</Title>
      <CourseTable />
    </div>
  )
}