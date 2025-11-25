// src/components/admin/tag/TagCreateModal.tsx
'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateTag } from '@/hooks/tag/useCreateTag'

interface TagCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const TagCreateModal = ({
  open,
  onClose,
  refetch,
}: TagCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateTag()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo thẻ thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo thẻ')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo thẻ mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên thẻ"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thẻ' },
            { min: 2, message: 'Tên thẻ phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên thẻ" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập mô tả thẻ (không bắt buộc)"
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