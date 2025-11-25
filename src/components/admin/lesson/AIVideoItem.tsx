// src/components/lessons/AIVideoItem.tsx
import React, { useState, useEffect } from 'react';
import { Tag, Button, Spin, Alert } from 'antd';
import { useVideoSync } from '@/hooks/heygen/video/useVideoSync';
import { HeygenVideo, AIVideoItemProps } from '@/types/heygen/video';

export const AIVideoItem: React.FC<AIVideoItemProps> = ({ 
  video, 
  autoSync = true 
}) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoadAttempt, setVideoLoadAttempt] = useState(0);

  // Sử dụng hook để đồng bộ trạng thái
    const { 
    data: videoStatus, 
    isLoading: isSyncing,
    isFetching 
    } = useVideoSync({
    videoId: video.id,
    enabled: !!video?.id, // luôn bật nếu có videoId
    refetchInterval: autoSync && ['PENDING', 'PROCESSING'].includes(video.status)
        ? 8000  // chỉ refetch khi đang xử lý
        : false // dừng refetch khi hoàn tất
    });
  // Sử dụng data từ hook hoặc từ prop
  const currentVideo = videoStatus ? { ...video, ...videoStatus } : video;


  // ... rest of the component remains exactly the same
  // Tạo embed URL từ link gốc HeyGen
  const heygenEmbedUrl = currentVideo.videoUrl?.includes('heygen.com') 
    ? currentVideo.videoUrl.replace("/videos/", "/embed/").replace("/share/", "/embed/")
    : '';

  const supabaseUrl = currentVideo.supabaseVideoUrl;

  // Check if video is ready to play
  useEffect(() => {
    if (currentVideo.status === 'COMPLETED' && (supabaseUrl || heygenEmbedUrl)) {
      setIsVideoReady(false);
      setVideoError(false);
      setVideoLoadAttempt(0);
      
      // Thêm delay để đảm bảo video đã processed hoàn toàn
      const timer = setTimeout(() => {
        setIsVideoReady(true);
      }, 2000); // 2 giây delay cho video processed

      return () => clearTimeout(timer);
    }
  }, [currentVideo.status, supabaseUrl, heygenEmbedUrl]);

  const handleVideoError = () => {
    console.log('❌ Video load error, attempt:', videoLoadAttempt + 1);
    setVideoLoadAttempt(prev => prev + 1);
    
    if (videoLoadAttempt >= 2) {
      setVideoError(true);
    } else {
      // Retry after delay
      setTimeout(() => {
        setIsVideoReady(true);
      }, 3000);
    }
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setVideoError(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
      case 'PROCESSING':
        return 'orange';
      case 'FAILED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'PENDING':
        return 'Đang chờ xử lý';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const renderVideoContent = () => {
    if (!isVideoReady) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-2 text-gray-500">Đang tải video...</p>
            <p className="text-sm text-gray-400">Video có thể mất vài phút để xử lý</p>
          </div>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Alert
            message="Không thể tải video"
            description={
              <div>
                <p>Video có thể đang được xử lý hoặc có lỗi.</p>
                <p>Vui lòng thử lại sau hoặc sử dụng link bên dưới.</p>
              </div>
            }
            type="warning"
            showIcon
            action={
              <Button 
                size="small" 
                onClick={() => {
                  setVideoError(false);
                  setVideoLoadAttempt(0);
                  setIsVideoReady(true);
                }}
              >
                Thử lại
              </Button>
            }
          />
        </div>
      );
    }

    // 🎯 ƯU TIÊN 1: HTML5 video player cho Supabase URL (direct MP4)
    if (supabaseUrl) {
      return (
        <video
          controls
          controlsList="nodownload"
          className="w-full h-full object-contain"
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          preload="metadata"
          poster="/video-poster.jpg" // Optional: Thêm poster image
        >
          <source src={supabaseUrl} type="video/mp4" />
          <source src={supabaseUrl} type="video/webm" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
          <p>
            <a href={supabaseUrl} download>
              Tải video về
            </a>
          </p>
        </video>
      );
    }

    // 🎯 FALLBACK 2: iframe cho HeyGen embed URL
    if (heygenEmbedUrl) {
      return (
        <iframe
          src={heygenEmbedUrl}
          title={currentVideo.title}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />
      );
    }

    // 🎯 FALLBACK 3: Direct link
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Video không thể hiển thị trực tiếp</p>
          <Button 
            type="primary" 
            href={currentVideo.videoUrl} 
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở video trong tab mới
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="font-medium flex items-center gap-2 mb-2">
        {currentVideo.title}
        {(isSyncing || isFetching) && <Spin size="small" />}
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        Trạng thái:{" "}
        <Tag color={getStatusColor(currentVideo.status)}>
          {getStatusText(currentVideo.status)}
          {(isSyncing || isFetching) && '...'}
        </Tag>
       
      </div>
      
      {currentVideo.status === 'COMPLETED' && (currentVideo.videoUrl || supabaseUrl) && (
        <>
          <div className='mb-3 flex gap-2 flex-wrap'>
            {/* HeyGen Link */}
            {currentVideo.videoUrl && currentVideo.videoUrl.includes('heygen.com') && (
              <Button
                type="primary"
                href={currentVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                icon={<span>🎬</span>}
              >
                Xem trên Heygen
              </Button>
            )}
            
            {/* Supabase Links */}
            {supabaseUrl && (
              <>
                <Button
                  type="default"
                  href={supabaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<span>📹</span>}
                >
                  Mở video trong tab mới
                </Button>
                <Button
                  type="dashed"
                  href={supabaseUrl}
                  download={`${currentVideo.title || 'video'}.mp4`}
                  icon={<span>💾</span>}
                >
                  Tải video
                </Button>
              </>
            )}
          </div>

          {/* Hiển thị video player */}
          <div className="aspect-video w-full rounded-lg border overflow-hidden bg-black">
            {renderVideoContent()}
          </div>

          {/* Video info */}
          <div className="mt-2 text-xs text-gray-500">
            {supabaseUrl ? (
              <div>
                <p>📁 Đã Lưu trữ</p>
                <p>🎯 Chất lượng: Tốt nhất</p>
              </div>
            ) : (
              <div>
                <p>📁 Lưu trữ: Heygen (Embed)</p>
                <p>⚠️ Có thể bị giới hạn</p>
              </div>
            )}
            {currentVideo.isDownloaded && (
              <p>✅ Đã sao lưu an toàn</p>
            )}
          </div>
        </>
      )}

      {(currentVideo.status === 'PENDING' || currentVideo.status === 'PROCESSING') && (
        <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
          <div className="flex items-center gap-2">
            <span>⏳ Video đang được xử lý, vui lòng chờ trong giây lát...</span>
          </div>
          {(isSyncing || isFetching) && (
            <p className="mt-1 text-orange-500 text-xs">(Đang cập nhật trạng thái...)</p>
          )}
        </div>
      )}

      {currentVideo.status === 'FAILED' && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>Tạo video thất bại</span>
          </div>
          {currentVideo.videoUrl && (
            <p className="mt-1 text-red-500 text-xs">
              Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          )}
        </div>
      )}
    </div>
  );
};