// src/components/heygen/AvatarSelect.tsx
import React from 'react';
import { Select } from 'antd';
import { AvatarOption } from './AvatarOption';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

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

interface AvatarSelectProps {
  avatars: Avatar[];
  loading?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  showTags?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selectorHeight?: number; // Đổi tên prop cho rõ nghĩa
}

export const AvatarSelect: React.FC<AvatarSelectProps> = ({
  avatars,
  loading = false,
  value,
  onChange,
  placeholder = "Chọn avatar...",
  showTags = true,
  size = 'md',
  selectorHeight = 95 // Default height cho selector
}) => {
  const selectedAvatar = avatars.find(avatar => avatar.id === value);

  return (
    <Select
      value={value}
      onChange={onChange}
      loading={loading}
      placeholder={placeholder}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        const avatar = avatars.find(a => a.id === option?.value);
        return (
          avatar?.name?.toLowerCase().includes(input.toLowerCase()) ||
          avatar?.displayName?.toLowerCase().includes(input.toLowerCase()) ||
          false
        );
      }}
      dropdownStyle={{ 
        maxHeight: 400,
        overflowY: 'auto'
      }}
      className="w-full custom-avatar-select"
      style={{
        height: `${selectorHeight}px`,
      }}
    >
      {avatars.map((avatar) => (
        <Option 
          key={avatar.id} 
          value={avatar.id}
        >
          <AvatarOption 
            avatar={avatar} 
            showTags={showTags}
            size={size}
          />
        </Option>
      ))}
    </Select>
  );
};