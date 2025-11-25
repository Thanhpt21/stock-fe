// src/components/admin/lesson/LessonUpdateModal.tsx
'use client'

import { Modal, Form, Input, Button, message, InputNumber, Select } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateLesson } from '@/hooks/lesson/useUpdateLesson'
import { useAllCourses } from '@/hooks/course/useAllCourses'
import { Lesson } from '@/types/lesson.type'
import DynamicRichTextEditor from '@/components/common/RichTextEditor'

const { TextArea } = Input
const { Option } = Select

interface LessonUpdateModalProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  refetch?: () => void
}

export const LessonUpdateModal = ({ open, onClose, lesson, refetch }: LessonUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateLesson()
  const { data: allCourses, isLoading: isLoadingCourses } = useAllCourses()
  const [content, setContent] = useState('') 

  useEffect(() => {
    if (lesson && open) {
      form.setFieldsValue({
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order,
        courseId: lesson.courseId,
        durationMin: lesson.durationMin,
      })
      setContent(lesson.content || '') 
    }
  }, [lesson, open, form])

  const onFinish = async (values: any) => {
    if (!lesson) return

    try {
      const payload = {
        title: values.title,
        content: content,
        videoUrl: values.videoUrl || '',
        order: Number(values.order) || 0,
        courseId: Number(values.courseId),
        durationMin: values.durationMin ? Number(values.durationMin) : undefined,
      }

      await mutateAsync({ id: lesson.id, data: payload })
      message.success('Cập nhật bài học thành công')
      onClose()
      form.resetFields()
      setContent('')
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật bài học')
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
      title="Cập nhật bài học" 
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
            Cập nhật bài học
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}