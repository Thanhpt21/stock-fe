// src/components/admin/lesson/LessonCreateModal.tsx
'use client'

import { Modal, Form, Input, Button, message, InputNumber, Select } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateLesson } from '@/hooks/lesson/useCreateLesson'
import { useAllCourses } from '@/hooks/course/useAllCourses'
import DynamicRichTextEditor from '@/components/common/RichTextEditor'

const { TextArea } = Input
const { Option } = Select

interface LessonCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
  defaultCourseId?: string // 🎯 SỬA THÀNH STRING
}

export const LessonCreateModal = ({ 
  open, 
  onClose, 
  refetch, 
  defaultCourseId 
}: LessonCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateLesson()
  const { data: allCourses, isLoading: isLoadingCourses } = useAllCourses()
  const [content, setContent] = useState('')

  // 🎯 THÊM EFFECT ĐỂ SET DEFAULT COURSE_ID
  useEffect(() => {
    if (open && defaultCourseId) {
      form.setFieldValue('courseId', parseInt(defaultCourseId))
    }
  }, [open, defaultCourseId, form])

  const onFinish = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        content: values.content,
        videoUrl: values.videoUrl || '',
        order: Number(values.order) || 0,
        courseId: Number(values.courseId),
        durationMin: values.durationMin ? Number(values.durationMin) : undefined,
      }

      await mutateAsync(payload)
      message.success('Tạo bài học thành công')
      onClose()
      form.resetFields()
      setContent('')
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo bài học')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setContent('')
    }
  }, [open, form])

  return (
    <Modal 
      title="Tạo bài học mới" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={800}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Khóa học"
          name="courseId"
          rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
        >
          <Select 
            placeholder={isLoadingCourses ? "Đang tải khóa học..." : "Chọn khóa học"}
            loading={isLoadingCourses}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (!option?.children) return false
              const childrenText = Array.isArray(option.children) 
                ? option.children.join(' ') 
                : String(option.children)
              return childrenText.toLowerCase().includes(input.toLowerCase())
            }}
            // 🎯 DISABLE SELECT KHI ĐÃ CÓ DEFAULT COURSE_ID
            disabled={!!defaultCourseId}
          >
            {allCourses?.map((course: any) => (
              <Option key={course.id} value={course.id}>
                {course.title} ({course.level})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tiêu đề bài học"
          name="title"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề bài học' },
            { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tiêu đề bài học" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Thứ tự"
            name="order"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
          >
            <InputNumber
              placeholder="0"
              min={0}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Thời lượng (phút)"
            name="durationMin"
          >
            <InputNumber
              placeholder="0"
              min={0}
              className="w-full"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="URL Video"
          name="videoUrl"
        >
          <Input placeholder="https://example.com/video.mp4" />
        </Form.Item>

         <Form.Item 
          label="Nội dung bài học"
        >
          <DynamicRichTextEditor
            value={content}
            onChange={setContent}
            height="300px"
          />
          <div className="text-xs text-gray-500 mt-2">
            💡 Sử dụng trình soạn thảo để tạo nội dung phong phú với định dạng văn bản, danh sách, links và hình ảnh
          </div>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            Tạo bài học
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}