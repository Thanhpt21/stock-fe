// src/components/admin/category/CategoryTable.tsx
'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useCategories } from '@/hooks/category/useCategories'
import { useDeleteCategory } from '@/hooks/category/useDeleteCategory'
import type { CategoryWithStats } from '@/types/category.type'
import { CategoryCreateModal } from './CategoryCreateModal'
import { CategoryUpdateModal } from './CategoryUpdateModal'


export default function CategoryTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithStats | null>(null)

  const { data, isLoading, refetch } = useCategories({ page, limit: 10, search })
  const { mutateAsync: deleteCategory } = useDeleteCategory()

  const columns: ColumnsType<CategoryWithStats> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Tag color="blue">{name}</Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '—',
    },
    {
      title: 'Số khóa học',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count} khóa học
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedCategory(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa danh mục',
                  content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}" không?${
                    record.courseCount > 0 ? ' Danh mục này đang có khóa học, việc xóa có thể ảnh hưởng đến các khóa học liên quan.' : ''
                  }`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCategory(record.id)
                      message.success('Xóa danh mục thành công')
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
          Tạo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} danh mục`,
        }}
      />

      <CategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <CategoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        category={selectedCategory}
        refetch={refetch}
      />
    </div>
  )
}