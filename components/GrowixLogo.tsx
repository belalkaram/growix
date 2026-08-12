'use client';

import React from 'react';
import Image from 'next/image';

interface GrowixLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  iconSize?: number;
  showSubtitle?: boolean;
}

export const GrowixLogo: React.FC<GrowixLogoProps> = ({
  variant = 'compact',
  theme = 'auto',
  className = '',
  iconSize = 38,
  showSubtitle = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Growix Image Logo */}
      <div 
        className="shrink-0 relative flex items-center justify-center transition-transform group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/growix-logo.png"
          alt="GROWIX"
          width={iconSize * 2}
          height={iconSize * 2}
          className="w-full h-full object-contain rounded-lg drop-shadow-sm"
          referrerPolicy="no-referrer"
          priority
        />
      </div>

      {/* Text Section */}
      {variant !== 'icon' && (
        <div className="flex flex-col text-right leading-none">
          <div className="flex items-center text-xl sm:text-2xl font-black tracking-wider font-sans" dir="ltr">
            <span className={theme === 'light' ? 'text-[#0B1220]' : 'text-white'}>
              GROW
            </span>
            <span className={theme === 'light' ? 'text-[#0B1220]' : 'text-white'}>
              I
            </span>
            <span className="text-[#00FF87] font-black">
              X
            </span>
          </div>

          {(showSubtitle || variant === 'full') && (
            <div className="flex items-center gap-1.5 mt-1 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase text-gray-400">
              <span className="w-2 h-[2px] bg-[#0F9D58] rounded-full shrink-0"></span>
              <span className="truncate">COURSES &amp; TOOLS</span>
              <span className="w-2 h-[2px] bg-[#0F9D58] rounded-full shrink-0"></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

