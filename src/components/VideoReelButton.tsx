'use client';

interface VideoReelButtonProps {
  onClick: () => void;
  videoCount: number;
}

export default function VideoReelButton({ onClick, videoCount }: VideoReelButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
    >
      {/* Animated rings */}
      <span className="absolute inset-0 rounded-full bg-[var(--pdd-red)] animate-ping opacity-30"></span>
      <span className="absolute inset-2 rounded-full border-2 border-white/30 animate-pulse"></span>

      {/* Icon */}
      <div className="relative flex flex-col items-center">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>

      {/* Badge */}
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-[var(--pdd-red)] text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
        {videoCount > 99 ? '99+' : videoCount}
      </span>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Видео рилстер
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></span>
      </span>
    </button>
  );
}