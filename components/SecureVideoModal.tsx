'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldAlert, Lock, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';

interface SecureVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  description?: string;
}

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const youtubeId = getYouTubeId(videoUrl);
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i);

  // YouTube embed with controls=0 (removes channel header, share button, copy link, and YT logo completely!)
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    : videoUrl;

  const sendYTCommand = (func: string, args: any = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      sendYTCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendYTCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendYTCommand('unMute');
      setIsMuted(false);
    } else {
      sendYTCommand('mute');
      setIsMuted(true);
    }
  };

  const restartVideo = () => {
    sendYTCommand('seekTo', [0, true]);
    sendYTCommand('playVideo');
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-fadeIn select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl bg-[#0B1220] border border-[#0F9D58]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
        dir="rtl"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-[#060B15] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F9D58]/20 border border-[#0F9D58]/30 flex items-center justify-center text-[#2ECC8F] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">{title}</h3>
              <span className="text-[10px] text-[#2ECC8F] font-bold block flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 inline shrink-0" />
                شرح مشفّر خاص بشركة GROWIX - غير قابل للشير أو النسخ الخارجى
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="إغلاق المشغّل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {youtubeId ? (
            <>
              {/* Iframe with controls=0 */}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={title}
                className="w-full h-full border-0 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {/* Top Security Shield Overlay (Completely covers top area where title/share could appear) */}
              <div 
                className="absolute top-0 left-0 right-0 h-16 z-20 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto flex items-center justify-between px-4"
                onClick={togglePlay}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC8F] animate-pulse" />
                  <span className="text-xs font-bold text-white/90">GROWIX Secure Stream</span>
                </div>
              </div>

              {/* Click-to-Play/Pause Central Overlay */}
              <div 
                className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                onClick={togglePlay}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-[#0F9D58]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20 transition-transform transform hover:scale-110">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                )}
              </div>

              {/* Bottom Custom Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-white/10 hover:bg-[#0F9D58] text-white transition-colors cursor-pointer"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={restartVideo}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                    title="إعادة التشغيل من البداية"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                    title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-300 font-bold hidden sm:inline">
                    مشغّل مشفّر بدون إعلانات
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                    title="شاشة كاملة"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
          <div className="p-4 bg-[#060B15] border-t border-white/10 text-xs text-gray-300 leading-relaxed max-h-32 overflow-y-auto shrink-0">
            <span className="font-bold text-[#2ECC8F] block mb-1">تعليمات وتفاصيل الفيديو:</span>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
