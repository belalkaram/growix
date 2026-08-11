'use client';

import React from 'react';
import { X, ShieldAlert, Lock, Play } from 'lucide-react';

interface SecureVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  description?: string;
}

// Helper to extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const SecureVideoModal: React.FC<SecureVideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videoUrl,
  description,
}) => {
  if (!isOpen) return null;

  const youtubeId = getYouTubeId(videoUrl);
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i);

  // Build YouTube nocookie URL with modestbranding, rel=0, no annotations
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&controls=1`
    : videoUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#0B1220] border border-[#0F9D58]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#060B15] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F9D58]/20 border border-[#0F9D58]/30 flex items-center justify-center text-[#2ECC8F]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">{title}</h3>
              <span className="text-[10px] text-[#2ECC8F] font-bold block flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 inline" />
                مشغّل شروحات GROWIX المشفر للعملاء المفعّلين فقط
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="إغلاق المشغّل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
          {youtubeId ? (
            <>
              {/* YouTube Privacy Iframe */}
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Top Shield Overlay (Blocks clicking channel name/logo at top of YouTube player) */}
              <div 
                className="absolute top-0 left-0 right-0 h-14 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto cursor-default flex items-start p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="text-[11px] font-extrabold text-white/90 bg-black/60 px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
                  <Play className="w-3 h-3 text-[#2ECC8F]" />
                  <span>{title}</span>
                </span>
              </div>

              {/* Bottom Right Shield Overlay (Blocks YouTube logo button) */}
              <div 
                className="absolute bottom-2 left-2 z-10 w-28 h-10 bg-transparent pointer-events-auto cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
            </>
          ) : isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain"
            >
              متصفحك لا يدعم تشغيل الفيديو المباشر.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer / Description */}
        {description && (
          <div className="p-4 bg-[#060B15] border-t border-white/10 text-xs text-gray-300 leading-relaxed max-h-32 overflow-y-auto">
            <span className="font-bold text-[#2ECC8F] block mb-1">تعليمات الفيديو:</span>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
