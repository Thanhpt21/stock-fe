// src/app/admin/course/[id]/lessons/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import LessonTable from '@/components/admin/lesson/LessonTable'

function CourseLessonsContent() {
  const params = useParams()
  const courseId = params.id as string

  console.log('✅ CourseLessonsContent - courseId:', courseId)

  if (!courseId) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-xl font-bold text-red-600">Không tìm thấy khóa học</h2>
          <p className="text-gray-600 mt-2">Vui lòng kiểm tra lại đường dẫn</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý bài học - Khóa học #{courseId}
        </h1>
        <p className="text-gray-600 mt-2">
          Danh sách bài học thuộc khóa học này
        </p>
      </div>
      
      <LessonTable courseId={courseId} />
    </div>
  )
}

export default function CourseLessonsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    }>
      <CourseLessonsContent />
    </Suspense>
  )
}