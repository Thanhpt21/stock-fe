// src/components/admin/lesson/LessonTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Select, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, EyeOutlined, SortAscendingOutlined, ArrowUpOutlined, ArrowDownOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useLessonsByCourseId } from '@/hooks/lesson/useLessonsByCourseId' // 🎯 SỬA HOOK
import { useDeleteLesson } from '@/hooks/lesson/useDeleteLesson'
import { useReorderLessons } from '@/hooks/lesson/useReorderLessons'
import { LessonCreateModal } from './LessonCreateModal'
import { LessonUpdateModal } from './LessonUpdateModal'
import { LessonDetail } from './LessonDetail'
import { Lesson } from '@/types/lesson.type'
import { useRouter } from 'next/navigation'

const { Option } = Select

interface LessonTableProps {
  courseId?: string
}

export default function LessonTable({ courseId }: LessonTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'reorder'>('list')
  const [reorderItems, setReorderItems] = useState<Lesson[]>([])
  
  const router = useRouter()

  // 🎯 SỬA HOOK - SỬ DỤNG USE_LESSONS_BY_COURSE_ID
  const { data: lessons = [], isLoading, refetch } = useLessonsByCourseId(
    courseId ? parseInt(courseId) : 0
  )

  const { mutateAsync: deleteLesson } = useDeleteLesson()
  const { mutateAsync: reorderLessons, isPending: isReordering } = useReorderLessons()

  // 🎯 THÊM FILTER SEARCH CLIENT-SIDE
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(search.toLowerCase()) ||
    lesson.content?.toLowerCase().includes(search.toLowerCase())
  )

  // 🎯 PAGINATION CLIENT-SIDE
  const paginatedLessons = filteredLessons.slice((page - 1) * 10, page * 10)
  const total = filteredLessons.length

  console.log("courseId", courseId)
  console.log("lessons", lessons)

  // Khởi tạo items cho chế độ sắp xếp
  useEffect(() => {
    if (lessons.length > 0 && viewMode === 'reorder') {
      setReorderItems([...lessons].sort((a, b) => a.order - b.order))
    }
  }, [lessons, viewMode])

  const columns: ColumnsType<Lesson> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      width: 150,
      render: (course: any) => course?.title || 'N/A',
    },
    {
      title: 'Thời lượng',
      dataIndex: 'durationMin',
      key: 'durationMin',
      width: 100,
      render: (duration: number | null) => 
        duration ? `${duration} phút` : 'Chưa có',
    },
    {
      title: 'Video',
      dataIndex: 'videoUrl',
      key: 'videoUrl',
      width: 80,
      align: 'center',
      render: (videoUrl: string | null) => 
        videoUrl ? (
          <Tooltip title="Có video">
            <PlayCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
          </Tooltip>
        ) : (
          <Tag color="default">Không có</Tag>
        ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'totalViews',
      key: 'totalViews',
      width: 90,
      render: (views: number) => views?.toLocaleString('vi-VN') || 0,
    },
    {
      title: 'AI Videos',
      dataIndex: 'stats',
      key: 'heygenVideos',
      width: 100,
      render: (stats: any) => (
        <Tag color={stats?.heygenVideoCount > 0 ? 'blue' : 'default'}>
          {stats?.heygenVideoCount || 0}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#722ed1', cursor: 'pointer' }}
              onClick={() => {
                setSelectedLesson(record)
                setViewMode('detail')
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedLesson(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa bài học',
                  content: `Bạn có chắc chắn muốn xóa bài học "${record.title}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteLesson(record.id)
                      message.success('Xóa bài học thành công')
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const handleResetFilters = () => {
    setInputValue('')
    setSearch('')
    setPage(1)
  }

  const handleBackToCourses = () => {
    router.push('/admin/course')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedLesson(null)
  }

  const handleEditFromDetail = () => {
    setOpenUpdate(true)
  }

  const handleEnterReorderMode = () => {
    if (lessons.length === 0) {
      message.warning('Không có bài học nào để sắp xếp')
      return
    }
    setViewMode('reorder')
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...reorderItems]
      const [movedItem] = newItems.splice(index, 1)
      newItems.splice(index - 1, 0, movedItem)
      setReorderItems(newItems)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < reorderItems.length - 1) {
      const newItems = [...reorderItems]
      const [movedItem] = newItems.splice(index, 1)
      newItems.splice(index + 1, 0, movedItem)
      setReorderItems(newItems)
    }
  }

  const handleSaveOrder = async () => {
    try {
      const currentCourseId = courseId ? parseInt(courseId) : reorderItems[0]?.courseId
      if (!currentCourseId) {
        message.error('Không tìm thấy thông tin khóa học')
        return
      }

      const reorderedLessons = reorderItems.map((lesson, index) => ({
        id: lesson.id,
        order: index + 1,
      }))

      await reorderLessons({
        courseId: currentCourseId,
        lessons: reorderedLessons,
      })

      message.success('Sắp xếp bài học thành công')
      setViewMode('list')
      refetch()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Sắp xếp thất bại')
    }
  }

  // Nếu đang ở chế độ xem chi tiết
  if (viewMode === 'detail' && selectedLesson) {
    return (
      <div className="p-4">
        <LessonDetail 
          lessonId={selectedLesson.id}
          onEdit={handleEditFromDetail}
        />
        
        <LessonUpdateModal
          open={openUpdate}
          onClose={() => {
            setOpenUpdate(false)
            refetch?.()
          }}
          lesson={selectedLesson}
          refetch={() => {
            refetch?.()
            setViewMode('list')
          }}
        />

        <div className="mt-4">
          <Button type="default" onClick={handleBackToList}>
            ← Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  // Nếu đang ở chế độ sắp xếp
  if (viewMode === 'reorder') {
    return (
      <div className="p-4">
        <Card
          title={
            <div className="flex items-center justify-between">
              <span>Sắp xếp bài học</span>
              <Tag color="orange">Chế độ sắp xếp</Tag>
            </div>
          }
          extra={
            <Space>
              <Button 
                onClick={handleBackToList}
              >
                ← Quay lại
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={isReordering}
                onClick={handleSaveOrder}
              >
                Lưu thứ tự
              </Button>
            </Space>
          }
        >
          <div className="space-y-3">
            {reorderItems.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      size="small" 
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    />
                    <Button 
                      size="small" 
                      icon={<ArrowDownOutlined />}
                      disabled={index === reorderItems.length - 1}
                      onClick={() => handleMoveDown(index)}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-lg">{lesson.title}</div>
                    <div className="text-gray-600 text-sm">
                      {lesson.durationMin ? `${lesson.durationMin} phút` : 'Chưa có thời lượng'} • 
                      {lesson.videoUrl ? ' Có video' : ' Không có video'} • 
                      {lesson.totalViews} lượt xem
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Thứ tự cũ</div>
                    <Tag color="blue">{lesson.order}</Tag>
                  </div>
                  
                  <div className="text-gray-400">→</div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Thứ tự mới</div>
                    <Tag color={lesson.order !== index + 1 ? 'orange' : 'green'}>
                      {index + 1}
                    </Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-2">
              💡 Hướng dẫn sắp xếp:
            </div>
            <div className="text-sm text-blue-600 space-y-1">
              <div>• Sử dụng nút <strong>↑↓</strong> để di chuyển bài học lên/xuống</div>
              <div>• Thứ tự <strong>màu xanh</strong> là thứ tự hiện tại trong hệ thống</div>
              <div>• Thứ tự <strong>màu cam</strong> là thứ tự mới sẽ được áp dụng</div>
              <div>• Nhấn <strong>"Lưu thứ tự"</strong> để áp dụng thay đổi</div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Chế độ danh sách
  return (
    <div className="p-4">
      {/* Nút quay lại danh sách khóa học */}
      <div className="mb-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToCourses}
          type="text"
        >
          Quay lại danh sách khóa học
        </Button>
      </div>

      {/* Thông tin khóa học */}
      {courseId && lessons.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">
                {lessons[0].course?.title || `Khóa học #${courseId}`}
              </h3>
              <p className="text-blue-600 text-sm mt-1">
                Tổng số bài học: <strong>{lessons.length}</strong>
              </p>
            </div>
            <Tag color="blue">Course #{courseId}</Tag>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          
          <Button onClick={handleResetFilters}>
            Đặt lại
          </Button>
        </div>

        <Space>
          <Button 
            icon={<SortAscendingOutlined />}
            onClick={handleEnterReorderMode}
            disabled={lessons.length === 0}
          >
            Sắp xếp ({lessons.length})
          </Button>
          <Button 
            type="primary" 
            onClick={() => setOpenCreate(true)}
            disabled={!courseId}
          >
            Tạo bài học
          </Button>
        </Space>
      </div>

      {/* Thông báo khi không có courseId */}
      {!courseId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">
            Vui lòng chọn khóa học để xem danh sách bài học.
          </p>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={paginatedLessons}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          total: total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} bài học`,
          showSizeChanger: false,
        }}
      />

      <LessonCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        defaultCourseId={courseId}
      />

      <LessonUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        lesson={selectedLesson}
        refetch={refetch}
      />
    </div>
  )
}