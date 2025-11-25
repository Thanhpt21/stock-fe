// src/components/heygen/AvatarOption.tsx
import React from 'react';
import { Tag } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';

interface Avatar {
  id: number;
  avatarId: string;
  name: string;
  displayName?: string;
  gender?: string;
  preview_image?: string;
  preview_video?: string;
  is_premium: boolean;
  is_free: boolean;
}

interface AvatarOptionProps {
  avatar: Avatar;
  showTags?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarOption: React.FC<AvatarOptionProps> = ({ 
  avatar, 
  showTags = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Avatar Image */}
      {avatar.preview_image ? (
        <img 
          src={avatar.preview_image} 
          alt={avatar.name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 hover:border-blue-400 transition-colors`}
          onError={(e) => {
            // Fallback icon nếu ảnh lỗi
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      
      {/* Fallback khi không có ảnh hoặc ảnh lỗi */}
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300 ${avatar.preview_image ? 'hidden' : ''}`}>
        <UserOutlined className="text-gray-400" />
      </div>

      {/* Avatar Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-gray-900 truncate ${textSizes[size]}`}>
          {avatar.name}
          {avatar.is_premium && (
            <CrownOutlined className="ml-1 text-yellow-500" />
          )}
        </div>
        
        {avatar.displayName && (
          <div className={`text-gray-500 truncate ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
            {avatar.displayName}
          </div>
        )}

        {/* Tags */}
        {showTags && (
          <div className="flex gap-1 mt-1 flex-wrap">
            <Tag 
              color={avatar.gender === 'male' ? 'blue' : 'pink'} 
              className="m-0"
            >
              {avatar.gender === 'male' ? '♂ Nam' : '♀ Nữ'}
            </Tag>
            <Tag 
              color={avatar.is_premium ? 'gold' : 'green'} 
              className="m-0"
            >
              {avatar.is_premium ? 'Premium' : 'Free'}
            </Tag>
          </div>
        )}
      </div>
    </div>
  );
};