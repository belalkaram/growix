'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ShieldAlert, 
  Lock, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  RotateCw,
  FastForward,
  Rewind,
  Settings,
  Gauge,
  Sliders,
  Check,
  Sparkles,
  ChevronDown
} from 'lucide-react';

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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

const QUALITY_OPTIONS = [
  { id: 'auto', label: 'تلقائي (Auto)', res: 'Auto' },
  { id: 'hd1080', label: '1080p Full HD', res: '1080p' },
  { id: 'hd720', label: '720p HD', res: '720p' },
  { id: 'large', label: '480p SD', res: '480p' },
  { id: 'medium', label: '360p Low', res: '360p' },
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SecureVideoModal: React.FC<SecureVideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videoUrl,
  description,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  
  // UI Menus
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'main' | 'quality' | 'speed'>('main');
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  
  // Visual Ripple Animations for Skip Forward / Backward
  const [skipFeedback, setSkipFeedback] = useState<{ type: 'forward' | 'backward'; id: number } | null>(null);

  const youtubeId = getYouTubeId(videoUrl);
  const isDirectVideo = Boolean(videoUrl && videoUrl.match(/\.(mp4|webm|ogg)$/i));

  // Trigger Visual Skip Feedback
  const triggerSkipFeedback = (type: 'forward' | 'backward') => {
    setSkipFeedback({ type, id: Date.now() });
    setTimeout(() => {
      setSkipFeedback((prev) => (prev?.type === type ? null : prev));
    }, 600);
  };

  // ─────────────────────────────────────────────────────────────
  // YouTube IFrame API Initialization
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !youtubeId) return;

    let isMounted = true;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }

      ytPlayerRef.current = new (window as any).YT.Player('growix-secure-yt-player', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            const p = event.target;
            setDuration(p.getDuration() || 0);
            setIsPlaying(true);
            p.playVideo();

            // Progress Poller
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = setInterval(() => {
              if (p && typeof p.getCurrentTime === 'function' && !isDraggingSeek) {
                const cur = p.getCurrentTime() || 0;
                const dur = p.getDuration() || 0;
                setCurrentTime(cur);
                if (dur > 0) setDuration(dur);

                if (typeof p.getVideoLoadedFraction === 'function') {
                  setBufferedPercent((p.getVideoLoadedFraction() || 0) * 100);
                }
              }
            }, 250);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) setIsPlaying(true);
            else if (event.data === 2 || event.data === 0) setIsPlaying(false);
          },
          onPlaybackQualityChange: (event: any) => {
            if (!isMounted) return;
            if (event.data) setSelectedQuality(event.data);
          },
          onPlaybackRateChange: (event: any) => {
            if (!isMounted) return;
            if (event.data) setPlaybackSpeed(event.data);
          },
        },
      });
    };

    // Load YouTube Iframe API Script if not already loaded
    if (!(window as any).YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initYT();
      };
    } else {
      initYT();
    }

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [isOpen, youtubeId]);

  // ─────────────────────────────────────────────────────────────
  // Direct Video Event Listeners
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = nativeVideoRef.current;
    if (!isOpen || !video || !isDirectVideo) return;

    const handleTimeUpdate = () => {
      if (!isDraggingSeek) {
        setCurrentTime(video.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedPercent((bufferedEnd / (video.duration || 1)) * 100);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isOpen, isDirectVideo, isDraggingSeek]);

  // ─────────────────────────────────────────────────────────────
  // Playback Control Actions
  // ─────────────────────────────────────────────────────────────
  const handleTogglePlay = () => {
    if (youtubeId && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else if (nativeVideoRef.current) {
      if (isPlaying) {
        nativeVideoRef.current.pause();
      } else {
        nativeVideoRef.current.play();
      }
    }
  };

  const handleSeek = (timeInSeconds: number) => {
    const target = Math.max(0, Math.min(duration || 0, timeInSeconds));
    setCurrentTime(target);

    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(target, true);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = target;
    }
  };

  // Skip Forward 5 Seconds
  const handleSkipForward5 = () => {
    const nextTime = Math.min(duration, currentTime + 5);
    handleSeek(nextTime);
    triggerSkipFeedback('forward');
  };

  // Skip Backward 5 Seconds
  const handleSkipBackward5 = () => {
    const prevTime = Math.max(0, currentTime - 5);
    handleSeek(prevTime);
    triggerSkipFeedback('backward');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (youtubeId && ytPlayerRef.current) {
      if (nextMuted) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.muted = nextMuted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const muted = val === 0;
    setIsMuted(muted);

    if (youtubeId && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(val * 100);
      if (muted) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.volume = val;
      nativeVideoRef.current.muted = muted;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      ytPlayerRef.current.setPlaybackRate(speed);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const handleQualityChange = (qualityId: string) => {
    setSelectedQuality(qualityId);
    if (youtubeId && ytPlayerRef.current) {
      if (typeof ytPlayerRef.current.setPlaybackQuality === 'function') {
        ytPlayerRef.current.setPlaybackQuality(qualityId);
      }
      if (typeof ytPlayerRef.current.setPlaybackQualityRange === 'function') {
        ytPlayerRef.current.setPlaybackQualityRange(qualityId, qualityId);
      }
    }
    setShowSettingsMenu(false);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Scrubber Mouse / Touch Events
  const calculateScrubTime = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    // Support RTL / LTR calculation cleanly
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    return ratio * duration;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = calculateScrubTime(e);
    handleSeek(time);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverTime(ratio * duration);
    setHoverPosition(clickX);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  // Keyboard Navigation Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture inputs if active
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // In Arabic RTL: ArrowLeft = Rewind 5s
        handleSkipBackward5();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // In Arabic RTL: ArrowRight = Forward 5s
        handleSkipForward5();
      } else if (e.key === 'm') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isMuted, currentTime, duration]);

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn select-none font-sans"
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl bg-[#0B1220] border border-[#0F9D58]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] group/player"
        dir="rtl"
      >
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-4 bg-[#060B15]/95 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0F9D58]/20 border border-[#0F9D58]/30 flex items-center justify-center text-[#2ECC8F] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">{title}</h3>
              <span className="text-[10px] text-[#2ECC8F] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 inline shrink-0" />
                <span>مشغل تدريبي محمي من GROWIX</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="إغلاق المشغّل (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          
          {youtubeId ? (
            <div className="w-full h-full relative">
              {/* Target Div where YouTube IFrame mounts */}
              <div id="growix-secure-yt-player" className="w-full h-full pointer-events-none" />

              {/* Click-to-Play/Pause Central Overlay */}
              <div 
                className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                onClick={handleTogglePlay}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-[#0F9D58]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20 transition-transform transform hover:scale-110">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                )}
              </div>
            </div>
          ) : isDirectVideo ? (
            <div className="w-full h-full relative" onClick={handleTogglePlay}>
              <video
                ref={nativeVideoRef}
                src={videoUrl}
                autoPlay
                playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain cursor-pointer"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-[#0F9D58]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <iframe
              src={videoUrl}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}

          {/* ⚡ Visual Skip Feedback Toast Animation */}
          {skipFeedback && (
            <div className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center ${
              skipFeedback.type === 'forward' ? 'left-12' : 'right-12'
            }`}>
              <div className="px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-[#2ECC8F]/40 text-white flex items-center gap-2 shadow-2xl animate-bounce">
                {skipFeedback.type === 'forward' ? (
                  <>
                    <FastForward className="w-5 h-5 text-[#2ECC8F]" />
                    <span className="font-mono font-black text-sm text-[#2ECC8F]">+5s</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono font-black text-sm text-[#2ECC8F]">-5s</span>
                    <Rewind className="w-5 h-5 text-[#2ECC8F]" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bottom Security Gradient & Stream Info */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#2ECC8F] animate-ping" />
            <span>GROWIX Stream HD</span>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* Custom Full Controls Bar (Progress Bar + Buttons + Quality) */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/85 to-transparent pt-6 pb-2 px-3 sm:px-4 space-y-2.5 transition-opacity duration-200">
            
            {/* 1. Interactive Progress Bar (مؤشر التقدم والتأخر) */}
            <div 
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              onMouseMove={handleProgressBarMouseMove}
              onMouseLeave={handleProgressBarMouseLeave}
              className="relative w-full h-2 hover:h-3.5 bg-white/20 rounded-full cursor-pointer transition-all flex items-center group/bar"
              dir="ltr"
            >
              {/* Buffered Bar */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-white/30 rounded-full transition-all"
                style={{ width: `${bufferedPercent}%` }}
              />

              {/* Played Progress Bar */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#0F9D58] to-[#2ECC8F] rounded-full flex items-center justify-end"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Scrubber Thumb Knob */}
                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-[#0F9D58] scale-0 group-hover/bar:scale-100 transition-transform -mr-1.5" />
              </div>

              {/* Hover Timestamp Tooltip */}
              {hoverTime !== null && hoverPosition !== null && (
                <div 
                  className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0F172A] border border-white/20 text-[10px] font-mono font-bold text-white shadow-lg pointer-events-none"
                  style={{ left: `${hoverPosition}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* 2. Control Buttons Toolbar */}
            <div className="flex items-center justify-between gap-2 text-white">
              
              {/* Left Side Controls (Play / Skip / Volume / Timer) */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                
                {/* Play / Pause */}
                <button
                  onClick={handleTogglePlay}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-[#0F9D58] text-white transition-colors cursor-pointer"
                  title={isPlaying ? 'إيقاف مؤقت (Space)' : 'تشغيل (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
                </button>

                {/* ⏪ Skip Backward 5 Seconds (مؤشر التأخر 5 ثواني) */}
                <button
                  onClick={handleSkipBackward5}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                  title="تأخير 5 ثواني (سهم يسار)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#2ECC8F]" />
                  <span className="text-[11px] font-mono font-black">-5s</span>
                </button>

                {/* ⏩ Skip Forward 5 Seconds (مؤشر التقدم 5 ثواني) */}
                <button
                  onClick={handleSkipForward5}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                  title="تقديم 5 ثواني (سهم يمين)"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#2ECC8F]" />
                  <span className="text-[11px] font-mono font-black">+5s</span>
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-1 group/volume">
                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                    title={isMuted ? 'إلغاء الكتم (M)' : 'كتم الصوت (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2ECC8F] hidden group-hover/volume:inline-block transition-all"
                    title="مستوى الصوت"
                  />
                </div>

                {/* Time Display */}
                <div className="text-[11px] sm:text-xs font-mono text-gray-300 font-bold px-1.5">
                  <span className="text-white">{formatTime(currentTime)}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Side Controls (Quality / Speed / Fullscreen) */}
              <div className="flex items-center gap-1.5 sm:gap-2 relative">
                
                {/* ⚙️ Settings / Quality & Speed Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      setActiveSettingsTab('main');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showSettingsMenu 
                        ? 'bg-[#0F9D58] border-[#0F9D58] text-white' 
                        : 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200'
                    }`}
                    title="إعدادات الجودة والسرعة"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono hidden sm:inline">
                      {QUALITY_OPTIONS.find(q => q.id === selectedQuality)?.res || 'HD'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  {/* Settings Popup Menu */}
                  {showSettingsMenu && (
                    <div 
                      className="absolute bottom-full left-0 mb-2 w-56 bg-[#0B1220] border border-white/20 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      dir="rtl"
                    >
                      {activeSettingsTab === 'main' && (
                        <>
                          <div className="px-2.5 py-1.5 font-black text-gray-400 text-[10px] border-b border-white/10">
                            إعدادات المشغّل
                          </div>

                          {/* Quality Option Row */}
                          <button
                            onClick={() => setActiveSettingsTab('quality')}
                            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 text-right flex items-center justify-between text-gray-200 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Sliders className="w-3.5 h-3.5 text-[#2ECC8F]" />
                              <span>جودة الفيديو</span>
                            </span>
                            <span className="text-[11px] font-mono text-[#2ECC8F] font-bold">
                              {QUALITY_OPTIONS.find(q => q.id === selectedQuality)?.res || 'Auto'} &gt;
                            </span>
                          </button>

                          {/* Speed Option Row */}
                          <button
                            onClick={() => setActiveSettingsTab('speed')}
                            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 text-right flex items-center justify-between text-gray-200 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Gauge className="w-3.5 h-3.5 text-blue-400" />
                              <span>سرعة التشغيل</span>
                            </span>
                            <span className="text-[11px] font-mono text-blue-400 font-bold">
                              {playbackSpeed === 1 ? 'عادي (1x)' : `${playbackSpeed}x`} &gt;
                            </span>
                          </button>
                        </>
                      )}

                      {/* Quality Sub-menu */}
                      {activeSettingsTab === 'quality' && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setActiveSettingsTab('main')}
                            className="w-full px-2 py-1 text-[11px] text-gray-400 hover:text-white text-right border-b border-white/10 pb-1 mb-1 font-bold cursor-pointer"
                          >
                            &lt; رجوع لقائمة الإعدادات
                          </button>
                          
                          {QUALITY_OPTIONS.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => handleQualityChange(q.id)}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                selectedQuality === q.id 
                                  ? 'bg-[#0F9D58]/20 text-[#2ECC8F] font-black' 
                                  : 'hover:bg-white/10 text-gray-300'
                              }`}
                            >
                              <span>{q.label}</span>
                              {selectedQuality === q.id && <Check className="w-3.5 h-3.5 text-[#2ECC8F]" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Speed Sub-menu */}
                      {activeSettingsTab === 'speed' && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setActiveSettingsTab('main')}
                            className="w-full px-2 py-1 text-[11px] text-gray-400 hover:text-white text-right border-b border-white/10 pb-1 mb-1 font-bold cursor-pointer"
                          >
                            &lt; رجوع لقائمة الإعدادات
                          </button>

                          {SPEED_OPTIONS.map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleSpeedChange(spd)}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                playbackSpeed === spd 
                                  ? 'bg-blue-500/20 text-blue-400 font-black' 
                                  : 'hover:bg-white/10 text-gray-300'
                              }`}
                            >
                              <span>{spd === 1 ? '1x (السرعة العادية)' : `${spd}x`}</span>
                              {playbackSpeed === spd && <Check className="w-3.5 h-3.5 text-blue-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={handleToggleFullscreen}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                  title={isFullscreen ? 'تصغير الشاشة (F)' : 'شاشة كاملة (F)'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer / Video Instructions */}
        {description && (
          <div className="p-3.5 sm:p-4 bg-[#060B15] border-t border-white/10 text-xs text-gray-300 leading-relaxed max-h-28 overflow-y-auto shrink-0 space-y-1">
            <span className="font-bold text-[#2ECC8F] block">تعليمات وملاحظات الشرح:</span>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
