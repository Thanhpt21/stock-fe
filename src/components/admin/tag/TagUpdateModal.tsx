// src/components/admin/tag/TagUpdateModal.tsx
'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useUpdateTag } from '@/hooks/tag/useUpdateTag'
import type { TagWithStats } from '@/types/tag.type'

interface TagUpdateModalProps {
  open: boolean
  onClose: () => void
  tag: TagWithStats | null
  refetch?: () => void
}

export const TagUpdateModal = ({
  open,
  onClose,
  tag,
  refetch,
}: TagUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateTag()

  useEffect(() => {
    if (tag && open) {
      form.setFieldsValue({
        name: tag.name,
        description: tag.description,
      })
    }
  }, [tag, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: tag!.id,
        data: values,
      })
      message.success('Cập nhật thẻ thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật thẻ')
    }
  }

  return (
    <Modal
      title="Cập nhật thẻ"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}