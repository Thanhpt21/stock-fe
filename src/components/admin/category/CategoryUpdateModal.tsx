// src/components/admin/category/CategoryUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useUpdateCategory } from '@/hooks/category/useUpdateCategory'

interface CategoryUpdateModalProps {
  open: boolean
  onClose: () => void
  category: any
  refetch?: () => void
}

export const CategoryUpdateModal = ({
  open,
  onClose,
  category,
  refetch,
}: CategoryUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateCategory()

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      })
    }
  }, [category, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: category.id,
        data: values,
      })
      message.success('Cập nhật danh mục thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật danh mục')
    }
  }

  return (
    <Modal
      title="Cập nhật danh mục"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}