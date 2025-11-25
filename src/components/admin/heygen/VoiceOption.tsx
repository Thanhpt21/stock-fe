// src/components/heygen/VoiceOption.tsx
import React, { useState, useRef } from 'react';
import { Tag, Button } from 'antd';
import { SoundOutlined, PlayCircleOutlined, PauseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

interface Voice {
  id: number;
  voiceId: string;
  name: string;
  displayName: string;
  gender: string;
  language: string;
  preview_audio?: string;
  is_premium: boolean;
  is_free: boolean;
}

interface VoiceOptionProps {
  voice: Voice;
  showTags?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

export const VoiceOption: React.FC<VoiceOptionProps> = ({ 
  voice, 
  showTags = true,
  size = 'md',
  selected = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const handlePlayPreview = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn select option khi click play
    
    if (!voice.preview_audio) return;

    try {
      setIsLoading(true);
      
      if (audioRef.current) {
        // Nếu đang phát thì dừng
        if (isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
          return;
        }
      }

      // Tạo audio element mới
      const audio = new Audio(voice.preview_audio);
      audioRef.current = audio;

      audio.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });

      audio.addEventListener('canplaythrough', () => {
        setIsLoading(false);
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', () => {
        setIsLoading(false);
        setIsPlaying(false);
        console.error('Lỗi phát audio:', voice.name);
      });

      await audio.play();
      
    } catch (error) {
      console.error('Lỗi phát audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleStopPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}>
      {/* Voice Icon với Play Button */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center`}>
          <SoundOutlined className="text-blue-600" />
        </div>
        
        {/* Play/Pause Button */}
        {voice.preview_audio && (
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={
              isLoading ? (
                <LoadingOutlined />
              ) : isPlaying ? (
                <PauseCircleOutlined />
              ) : (
                <PlayCircleOutlined />
              )
            }
            className="absolute -bottom-1 -right-1 w-6 h-6 min-w-6 shadow-md"
            onClick={isPlaying ? handleStopPreview : handlePlayPreview}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Voice Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate flex items-center gap-2">
          {voice.name}
          {voice.is_premium && (
            <Tag color="gold" className="m-0">
              Premium
            </Tag>
          )}
        </div>
        
        <div className="text-sm text-gray-500 truncate">
          {voice.displayName}
        </div>

        {/* Tags */}
        {showTags && (
          <div className="flex gap-1 mt-1 flex-wrap">
            <Tag 
              color={voice.gender === 'male' ? 'blue' : 'pink'} 
              className="m-0"
            >
              {voice.gender === 'male' ? '♂ Nam' : '♀ Nữ'}
            </Tag>
            <Tag 
              color={voice.language ? 'purple' : 'default'} 
              className="m-0"
            >
              {voice.language || 'No language'}
            </Tag>
            {!voice.preview_audio && (
              <Tag color="red" className="m-0">
                No Preview
              </Tag>
            )}
          </div>
        )}
      </div>
    </div>
  );
};