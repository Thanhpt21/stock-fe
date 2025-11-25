// src/components/admin/lesson/LessonDetail.tsx
'use client'

import { Card, Descriptions, Tag, Space, Button, Divider, Row, Col, Statistic, message } from 'antd'
import { EditOutlined, EyeOutlined, PlayCircleOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { useLessonOneForAdmin } from '@/hooks/lesson/useLessonOneForAdmin'
import { useState } from 'react'
import { LessonAIVideos } from './LessonAIVideos'

interface LessonDetailProps {
  lessonId: number
  onEdit?: () => void
}

// 🎯 COMPONENT HIỂN THỊ HTML AN TOÀN
const SafeHTMLRenderer = ({ html }: { html: string }) => {
  // 🎯 FUNCTION XỬ LÝ HTML AN TOÀN (CƠ BẢN)
  const sanitizeHTML = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .replace(/on\w+='[^']*'/g, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: URLs
  }

  return (
    <div 
      className="prose max-w-none p-4 bg-gray-50 rounded border"
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  )
}

export const LessonDetail = ({ lessonId, onEdit }: LessonDetailProps) => {
    const { data: lesson, isLoading, refetch } = useLessonOneForAdmin(lessonId) 
    const [htmlPreview, setHtmlPreview] = useState(false)
  if (isLoading) {
    return <Card loading={true} />
  }

  if (!lesson) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">Không tìm thấy bài học</div>
          <Button type="primary" className="mt-4" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
          <div className="text-gray-500 mt-1">
            Khóa học: <span className="text-blue-600 font-medium">{lesson.course?.title}</span>
          </div>
        </div>
        
        <Space>
         
          <Button 
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            Chỉnh sửa
          </Button>
        </Space>
      </div>

      {/* Stats Row */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Lượt xem"
              value={lesson.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thời lượng"
              value={lesson.durationMin || 0}
              suffix="phút"
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AI Videos"
              value={lesson.stats?.heygenVideoCount || 0}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Người học"
              value={lesson.stats?.progressCount || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          {/* Thông tin chi tiết */}
          <Card title="Thông tin chi tiết" className="mb-4">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tiêu đề" span={2}>
                <span className="font-medium text-lg">{lesson.title}</span>
              </Descriptions.Item>
              
              <Descriptions.Item label="Khóa học">
                <Tag color="blue">{lesson.course?.title}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Thứ tự">
                <Tag color="green">#{lesson.order}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Thời lượng">
                {lesson.durationMin ? (
                  <Tag color="orange">{lesson.durationMin} phút</Tag>
                ) : (
                  <Tag color="default">Chưa có</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái Video">
                {lesson.videoUrl ? (
                  <Tag color="success" icon={<PlayCircleOutlined />}>
                    Có video
                  </Tag>
                ) : (
                  <Tag color="default">Không có video</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {new Date(lesson.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(lesson.updatedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>

              {lesson.videoUrl && (
                <Descriptions.Item label="URL Video" span={2}>
                  <a 
                    href={lesson.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {lesson.videoUrl}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Nội dung bài học */}
        <Card 
            title={
              <div className="flex items-center justify-between">
                <span>Nội dung bài học</span>
                 {/* <Button 
                    type="dashed"
                    onClick={() => setHtmlPreview(!htmlPreview)}
                >
                    {htmlPreview ? 'Xem định dạng' : 'Xem mã HTML'}
                </Button> */}
                <Tag color={htmlPreview ? 'orange' : 'blue'}>
                  {htmlPreview ? 'Chế độ xem HTML' : 'Chế độ xem định dạng'}
                </Tag>
              </div>
            }
          >
            {lesson.content ? (
              <>
                {htmlPreview ? (
                  // 🎯 CHẾ ĐỘ XEM HTML SOURCE
                  <div className="p-4 bg-gray-900 text-green-400 rounded border font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
                    {lesson.content}
                  </div>
                ) : (
                  // 🎯 CHẾ ĐỘ XEM ĐỊNH DẠNG
                  <SafeHTMLRenderer html={lesson.content} />
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  💡 <strong>Định dạng được lưu:</strong> {htmlPreview ? 
                    'Đang hiển thị mã HTML gốc' : 
                    'Đang hiển thị với định dạng rich text'
                  }
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PlayCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Chưa có nội dung bài học</div>
                <Button type="primary" className="mt-4" onClick={onEdit}>
                  Thêm nội dung
                </Button>
              </div>
            )}
          </Card>
            {/* AI Videos */}
         <LessonAIVideos 
            heygenVideos={lesson.heygenVideos}
            lessonId={lesson.id}
            onVideoCreated={() => {
              refetch();
            }}
          />
        </Col>

        <Col span={8}>
          {/* Thông tin khóa học */}
          <Card title="Thông tin khóa học" className="mb-4">
            <div className="space-y-3">
              <div>
                <strong>Tiêu đề:</strong>
                <div className="text-blue-600 font-medium">{lesson.course?.title}</div>
              </div>
              
              <div>
                <strong>Giảng viên:</strong>
                <div>{lesson.course?.instructor?.name || 'N/A'}</div>
              </div>
              
              <div>
                <strong>Email giảng viên:</strong>
                <div>{lesson.course?.instructor?.email || 'N/A'}</div>
              </div>
              
           
            </div>
          </Card>
 {/* Thông tin định dạng */}
          <Card title="Thông tin định dạng">
            <div className="space-y-3 text-sm">
              <div>
                <strong>Định dạng lưu trữ:</strong>
                <Tag color="green" className="ml-2">HTML</Tag>
              </div>
              
              <div>
                <strong>Trạng thái nội dung:</strong>
                <Tag color={lesson.content ? 'success' : 'default'} className="ml-2">
                  {lesson.content ? 'Đã có nội dung' : 'Chưa có nội dung'}
                </Tag>
              </div>
              
              {lesson.content && (
                <>
                  <div>
                    <strong>Độ dài nội dung:</strong>
                    <div>{lesson.content.length} ký tự</div>
                  </div>
                  
                  <div>
                    <strong>Chứa hình ảnh:</strong>
                    <Tag color={lesson.content.includes('<img') ? 'blue' : 'default'} className="ml-2">
                      {lesson.content.includes('<img') ? 'Có' : 'Không'}
                    </Tag>
                  </div>
                  
                  <div>
                    <strong>Chứa links:</strong>
                    <Tag color={lesson.content.includes('<a href') ? 'blue' : 'default'} className="ml-2">
                      {lesson.content.includes('<a href') ? 'Có' : 'Không'}
                    </Tag>
                  </div>
                </>
              )}
            </div>
          </Card>
        

        </Col>
      </Row>
    </div>
  )
}