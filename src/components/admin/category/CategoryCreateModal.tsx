// src/components/admin/category/CategoryCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateCategory } from '@/hooks/category/useCreateCategory'

interface CategoryCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const CategoryCreateModal = ({
  open,
  onClose,
  refetch,
}: CategoryCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateCategory()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo danh mục thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo danh mục')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo danh mục mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục' },
            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập mô tả danh mục (không bắt buộc)"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}