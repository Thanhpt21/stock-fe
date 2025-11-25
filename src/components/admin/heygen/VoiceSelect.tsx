// src/components/heygen/VoiceSelect.tsx
import React, { useState, useRef } from 'react';
import { VoiceOption } from './VoiceOption';
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

interface VoiceSelectProps {
  voices: Voice[];
  loading?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  showTags?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selectorHeight?: number;
}

export const VoiceSelect: React.FC<VoiceSelectProps> = ({
  voices,
  loading = false,
  value,
  onChange,
  placeholder = "Chọn giọng nói...",
  showTags = true,
  size = 'md',
  selectorHeight = 60
}) => {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const selectedVoice = voices.find(voice => voice.id === value);

  const handleSelect = (voiceId: number) => {
    onChange?.(voiceId);
    setOpen(false);
  };

  const handlePlayPreview = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn mở dropdown khi click play
    
    if (!selectedVoice?.preview_audio) return;

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
      const audio = new Audio(selectedVoice.preview_audio);
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
        console.error('Lỗi phát audio:', selectedVoice.name);
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

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="relative">
      {/* Custom Trigger */}
      <div 
        className="w-full border border-gray-300 rounded bg-white hover:border-blue-400 cursor-pointer transition-colors"
        style={{ height: `${selectorHeight}px`, minHeight: '60px' }}
        onClick={() => setOpen(!open)}
      >
        {selectedVoice ? (
          <div className="flex items-center gap-3 p-3 h-full">
            {/* Voice Icon với Play Button */}
            <div className="relative">
              <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center`}>
                <SoundOutlined className={`${iconSizes[size]} text-blue-600`} />
              </div>
              
              {/* Play/Pause Button cho voice đã chọn */}
              {selectedVoice.preview_audio && (
                <button
                  className={`absolute -bottom-1 -right-1 w-5 h-5 min-w-5 rounded-full shadow-md flex items-center justify-center ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  onClick={isPlaying ? handleStopPreview : handlePlayPreview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingOutlined className="text-white text-xs" />
                  ) : isPlaying ? (
                    <PauseCircleOutlined className="text-white text-xs" />
                  ) : (
                    <PlayCircleOutlined className="text-white text-xs" />
                  )}
                </button>
              )}
            </div>

            {/* Voice Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                {selectedVoice.name}
                {selectedVoice.is_premium && (
                  <span className="inline-block px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                    Premium
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500 truncate">
                {selectedVoice.displayName}
              </div>

              {/* Basic tags in selector */}
              <div className="flex gap-1 mt-1">
                <span className={`inline-block px-1.5 py-0.5 text-xs rounded ${
                  selectedVoice.gender === 'male' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {selectedVoice.gender === 'male' ? '♂ Nam' : '♀ Nữ'}
                </span>
                <span className="inline-block px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                  {selectedVoice.language || 'No language'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center h-full px-4 text-gray-400">
            {placeholder}
          </div>
        )}
      </div>

      {/* Custom Dropdown - Hiển thị BÊN TRÊN */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto mb-1">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Không có giọng nói nào
            </div>
          ) : (
            voices.map((voice) => (
              <div
                key={voice.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  value === voice.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(voice.id)}
              >
                <VoiceOption 
                  voice={voice} 
                  showTags={showTags}
                  size={size}
                  selected={value === voice.id}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};