// src/components/lessons/LessonAIVideos.tsx
import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { AIVideoItem } from './AIVideoItem';
import { useAvatars } from '@/hooks/heygen/avatar/useAvatars';
import { useVoicesByLanguageAndTier } from '@/hooks/heygen/voice/useVoicesByLanguageAndTier';
import { AvatarSelect } from '../heygen/AvatarSelect';
import { VoiceSelect } from '../heygen/VoiceSelect';
import { GenerateVideoDto, useGenerateVideo } from '@/hooks/heygen/video/useGenerateVideo';
import { useFilteredVoices } from '@/hooks/heygen/voice/useFilteredVoices';
import { LessonAIVideosProps, CreateVideoForm } from '@/types/heygen/video';

const { TextArea } = Input;
const { Option } = Select;

export const LessonAIVideos: React.FC<LessonAIVideosProps> = ({ 
  heygenVideos = [],
  lessonId,
  onVideoCreated
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'system' | 'eventlab'>('system');

  // Sử dụng hook generate video
  const generateVideoMutation = useGenerateVideo();

  // Sử dụng hooks cho avatars và voices
  const { data: avatars = [], isLoading: isLoadingAvatars } = useAvatars({
    isFree: true, // Chỉ lấy avatar miễn phí
    limit: 100
  });

  const { data: voices = [], isLoading: isLoadingVoices } = useVoicesByLanguageAndTier('English', 'free');
  const { eventLabVoices, systemVoices, allVoices } = useFilteredVoices(voices);



  const getFilteredVoices = () => {
    switch (voiceFilter) {
      case 'system':
        return systemVoices;
      case 'eventlab':
        return eventLabVoices;
      default:
        return allVoices;
    }
  };

  const filteredVoices = getFilteredVoices();
    console.log("filteredVoices", filteredVoices)
  
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: CreateVideoForm) => {
    try {
      // Chuẩn bị payload theo GenerateVideoDto
      const payload: GenerateVideoDto = {
        avatarId: values.avatarId,
        voiceId: values.voiceId,
        inputText: values.inputText,
        title: values.title,
        lessonId: lessonId,
        dimensionWidth: values.dimensionWidth,
        dimensionHeight: values.dimensionHeight,
      };

      console.log("payload", payload)

      // Sử dụng mutation từ hook
      await generateVideoMutation.mutateAsync(payload, {
        onSuccess: (response: any) => {
          message.success(response.message || 'Đã bắt đầu tạo video AI!');
          setIsModalVisible(false);
          form.resetFields();
          
          if (onVideoCreated) {
            onVideoCreated();
          }
        },
        onError: (error: Error) => {
          message.error('Lỗi khi tạo video: ' + error.message);
        }
      });

    } catch (error: any) {
      message.error('Lỗi khi tạo video: ' + error.message);
    }
  };

  return (
    <>
      <Card 
        title="AI Video bài học" 
        extra={
          <Button type="primary" onClick={showModal}>
            + Thêm video AI
          </Button>
        }
      >
        {!heygenVideos || heygenVideos.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Chưa có AI Video bài học
          </div>
        ) : (
          <div className="space-y-2">
            {heygenVideos.map((video) => (
              <AIVideoItem key={video.id} video={video} />
            ))}
          </div>
        )}
      </Card>

      {/* Modal tạo video AI */}
      <Modal
        title="Tạo video AI mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            dimensionWidth: 640,
            dimensionHeight: 360,
            lessonId: lessonId
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề video"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề video' }]}
          >
            <Input placeholder="Nhập tiêu đề video..." />
          </Form.Item>

          <Form.Item
            name="inputText"
            label="Nội dung script"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung script' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung mà AI sẽ đọc..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="avatarId"
              label="Chọn Avatar"
              rules={[{ required: true, message: 'Vui lòng chọn avatar' }]}
            >
              <AvatarSelect
                avatars={avatars}
                loading={isLoadingAvatars}
                placeholder="Chọn avatar cho video..."
                size="md"
                selectorHeight={95}
              />
            </Form.Item>

            <Form.Item
              name="voiceId"
              label="Chọn Giọng nói"
              rules={[{ required: true, message: 'Vui lòng chọn giọng nói' }]}
            >
              <VoiceSelect
                voices={filteredVoices}
                loading={isLoadingVoices}
                placeholder="Chọn giọng nói cho video..."
                size="md"
                selectorHeight={95}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="dimensionWidth"
              label="Chiều rộng video"
              rules={[{ required: true, message: 'Vui lòng nhập chiều rộng' }]}
            >
              <InputNumber
                min={320}
                max={1920}
                placeholder="Width"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="dimensionHeight"
              label="Chiều cao video"
              rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}
            >
              <InputNumber
                min={240}
                max={1080}
                placeholder="Height"
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={generateVideoMutation.isPending}
                disabled={generateVideoMutation.isPending}
              >
                {generateVideoMutation.isPending ? 'Đang tạo...' : 'Tạo video AI'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};