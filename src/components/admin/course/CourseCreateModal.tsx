'use client'

import { Modal, Form, Input, Button, Upload, message, InputNumber, Select, Switch } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCreateCourse } from '@/hooks/course/useCreateCourse'
import { useAllUsers } from '@/hooks/user/useAllUsers'
import { useAllRoles } from '@/hooks/role/useAllRoles'
import { useAllTags } from '@/hooks/tag/useAllTags'
import { useAllCategories } from '@/hooks/category/useAllCategories'
import { useAllCourses } from '@/hooks/course/useAllCourses'
import type { UploadFile } from 'antd/es/upload/interface'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'
import { CourseLevel } from '@/enums/course-level.enum'
import { useUploadImage } from '@/hooks/upload/useUploadImage'

const { TextArea } = Input
const { Option } = Select

interface CourseCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const CourseCreateModal = ({ open, onClose, refetch }: CourseCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const { mutateAsync, isPending } = useCreateCourse()
  const { data: allUsers, isLoading: isLoadingUsers } = useAllUsers()
  const { data: allRoles, isLoading: isLoadingRoles } = useAllRoles()
  const { data: allTags, isLoading: isLoadingTags } = useAllTags()
  const { data: allCategories, isLoading: isLoadingCategories } = useAllCategories()
  const { data: allCourses, isLoading: isLoadingCourses } = useAllCourses({ isPublished: true })
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage() 


  // Lọc users theo role được chọn
  const filteredUsers = allUsers?.filter((user: any) => {
    if (!selectedRole) return false
    return user.roles?.some((userRole: any) => 
      userRole.role?.name === selectedRole
    )
  }) || []

 const onFinish = async (values: any) => {
  try {
    let thumbnailUrl = null

    // Upload ảnh lên Supabase nếu có
    const file = fileList?.[0]?.originFileObj
    if (file) {
      try {
        thumbnailUrl = await uploadImage(file)
      } catch (uploadError) {
        console.error('❌ Upload ảnh thất bại:', uploadError)
        return 
      }
    }

    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description || '',
      level: values.level?.toUpperCase(),
      price: Number(values.price) || 0,
      isPublished: Boolean(values.isPublished),
      instructorId: Number(values.instructorId),
      categoryIds: values.categoryIds ? values.categoryIds.map((id: any) => Number(id)) : [],
      tagIds: values.tagIds ? values.tagIds.map((id: any) => Number(id)) : [],
      prerequisiteIds: values.prerequisiteIds ? values.prerequisiteIds.map((id: any) => Number(id)) : [],
      thumbnail: thumbnailUrl, // URL từ Supabase
    }

    await mutateAsync(payload)
    message.success('Tạo khóa học thành công')
    onClose()
    form.resetFields()
    setFileList([])
    setSelectedRole('')
    refetch?.()
  } catch (err: any) {
    message.error(err?.response?.data?.message || 'Lỗi tạo khóa học')
  }
}
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
      setSelectedRole('')
    }
  }, [open, form])

  // Reset instructor khi thay đổi role
  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    form.setFieldValue('instructorId', undefined)
  }

  return (
    <Modal 
      title="Tạo khóa học mới" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={700}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tiêu đề khóa học"
            name="title"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề khóa học' },
              { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tiêu đề khóa học" />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: 'Vui lòng nhập slug' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
            ]}
          >
            <Input placeholder="Nhập slug" />
          </Form.Item>
        </div>

        <Form.Item 
          label="Mô tả" 
          name="description"
          rules={[{ max: 500, message: 'Mô tả không quá 500 ký tự' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả ngắn về khóa học..." 
            showCount 
            maxLength={500}
          />
        </Form.Item>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Cấp độ"
            name="level"
            rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
          >
            <Select placeholder="Chọn cấp độ">
              <Option value={CourseLevel.BEGINNER}>Mới bắt đầu</Option>
              <Option value={CourseLevel.INTERMEDIATE}>Trung cấp</Option>
              <Option value={CourseLevel.ADVANCED}>Nâng cao</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
          >
            <InputNumber
              placeholder="0"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Xuất bản ngay"
            name="isPublished"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </div>

        {/* Hàng mới: Chọn role và chọn giảng viên cùng một hàng */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Vai trò phụ trách"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò phụ trách' }]}
          >
            <Select 
              placeholder={isLoadingRoles ? "Đang tải vai trò..." : "Chọn vai trò"}
              loading={isLoadingRoles}
              onChange={handleRoleChange}
              value={selectedRole}
              showSearch
              optionFilterProp="children"
            >
              {allRoles?.map((role: any) => (
                <Option key={role.id} value={role.name}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Chọn người phụ trách"
            name="instructorId"
            rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
            validateTrigger={['onChange', 'onBlur']}
            >
            <Select 
                placeholder={!selectedRole ? "Chọn vai trò trước" : (isLoadingUsers ? "Đang tải..." : "Chọn người phụ trách")}
                loading={isLoadingUsers}
                disabled={!selectedRole}
                showSearch
                filterOption={(input, option) => {
                if (!option?.children) return false
                const childrenText = Array.isArray(option.children) 
                    ? option.children.join(' ') 
                    : String(option.children)
                return childrenText.toLowerCase().includes(input.toLowerCase())
                }}
            >
                {filteredUsers.map((user: any) => (
                <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                </Option>
                ))}
                {selectedRole && filteredUsers.length === 0 && (
                <Option disabled value="no-user">
                    Không có user nào với role {selectedRole}
                </Option>
                )}
            </Select>
            </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Danh mục"
            name="categoryIds"
          >
            <Select 
              mode="multiple" 
              placeholder={isLoadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"}
              loading={isLoadingCategories}
              allowClear
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
              {allCategories?.map((category: any) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tagIds"
          >
            <Select 
              mode="multiple" 
              placeholder={isLoadingTags ? "Đang tải tags..." : "Chọn tags"}
              loading={isLoadingTags}
              allowClear
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
              {allTags?.map((tag: any) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          
        </div>
        <Form.Item
            label="Khóa học yêu cầu"
            name="prerequisiteIds"
          >
            <Select 
              mode="multiple" 
              placeholder={isLoadingCourses ? "Đang tải khóa học..." : "Chọn khóa học yêu cầu"}
              loading={isLoadingCourses}
              allowClear
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
          label="Hình ảnh thumbnail" 
          tooltip="Chấp nhận JPEG, PNG, JPG, WEBP. Tối đa 5MB"
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
            maxCount={1}
            accept={ACCEPTED_IMAGE_TYPES}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
            disabled={!selectedRole || filteredUsers.length === 0}
          >
            {!selectedRole ? 'Chọn vai trò trước' : filteredUsers.length === 0 ? 'Không có giảng viên' : 'Tạo khóa học'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}