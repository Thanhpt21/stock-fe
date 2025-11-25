// src/components/admin/course/CourseTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Image, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, EyeOutlined, SortAscendingOutlined, BookOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useCourses } from '@/hooks/course/useCourses'
import { useDeleteCourse } from '@/hooks/course/useDeleteCourse'
import { CourseCreateModal } from './CourseCreateModal'
import { CourseUpdateModal } from './CourseUpdateModal'
import { CourseLevel } from '@/enums/course-level.enum'
import { Course } from '@/types/course.type'
import { getImageUrl } from '@/utils/getImageUrl'
import { useRouter } from 'next/navigation' // 🎯 THÊM IMPORT

const { Option } = Select

export default function CourseTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [levelFilter, setLevelFilter] = useState<CourseLevel | ''>('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const router = useRouter() // 🎯 THÊM ROUTER

  const { data, isLoading, refetch } = useCourses({ 
    page, 
    limit: 10, 
    search,
    level: levelFilter || undefined,
    isPublished: statusFilter !== '' ? statusFilter : undefined
  })
  const { mutateAsync: deleteCourse } = useDeleteCourse()

  const courses = data?.data || []
  const total = data?.total || 0

  const columns: ColumnsType<Course> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 80,
      align: 'center',
      render: (thumbnail: string | null) => {
        const imageUrl = getImageUrl(thumbnail)
        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 20, color: '#d9d9d9' }} />
            </div>
          )
        }
        return (
          <Image
            src={imageUrl}
            alt="Course thumbnail"
            width={40}
            height={40}
            className="object-cover rounded"
            preview={{
              mask: <EyeOutlined />,
            }}
          />
        )
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
      width: 120,
      render: (instructor: any) => instructor?.name || 'N/A',
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: CourseLevel) => {
        const levelConfig = {
          [CourseLevel.BEGINNER]: { color: 'green', text: 'Mới bắt đầu' },
          [CourseLevel.INTERMEDIATE]: { color: 'orange', text: 'Trung cấp' },
          [CourseLevel.ADVANCED]: { color: 'red', text: 'Nâng cao' },
        }
        const config = levelConfig[level] || { color: 'default', text: level }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number | null) => 
        price ? `${price?.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'totalViews',
      key: 'totalViews',
      width: 90,
      render: (views: number) => views?.toLocaleString('vi-VN') || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 80,
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150, // 🎯 TĂNG WIDTH ĐỂ CHỨA THÊM NÚT
      render: (_, record) => (
        <Space size="small">
          {/* 🎯 THÊM NÚT QUẢN LÝ BÀI HỌC */}
          <Tooltip title="Quản lý bài học">
           <BookOutlined
              style={{ color: '#722ed1', cursor: 'pointer' }}
              onClick={() => {
                  router.push(`/admin/course/${record.id}/lessons`)
              }}
            />
          </Tooltip>
          
         

          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedCourse(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa khóa học',
                  content: `Bạn có chắc chắn muốn xóa khóa học "${record.title}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCourse(record.id)
                      message.success('Xóa khóa học thành công')
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
    setLevelFilter('')
    setStatusFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Tìm kiếm theo tiêu đề..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[250px]"
          />
          
          <Select
            placeholder="Cấp độ"
            value={levelFilter}
            onChange={setLevelFilter}
            allowClear
            className="w-[130px]"
          >
            <Option value={CourseLevel.BEGINNER}>Mới bắt đầu</Option>
            <Option value={CourseLevel.INTERMEDIATE}>Trung cấp</Option>
            <Option value={CourseLevel.ADVANCED}>Nâng cao</Option>
          </Select>

          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            className="w-[130px]"
          >
            <Option value={true}>Đã xuất bản</Option>
            <Option value={false}>Bản nháp</Option>
          </Select>

          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          
          <Button onClick={handleResetFilters}>
            Đặt lại
          </Button>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo khóa học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1300 }} // 🎯 TĂNG SCROLL ĐỂ CHỨA THÊM CỘT
        pagination={{
          total: total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} khóa học`,
          showSizeChanger: false,
        }}
      />

      <CourseCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <CourseUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        course={selectedCourse}
        refetch={refetch}
      />
    </div>
  )
}