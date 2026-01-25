declare module 'react-riyils' {
  import React from 'react';

  export interface Video {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    captionUrl?: string;
    caption?: string;
  }

  export interface RiyilsTranslations {
    close: string;
    speedIndicator: string;
    forward: string;
    rewind: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    videoPlayer: string;
    more: string;
    less: string;
  }

  export interface RiyilsViewerControlContext {
    currentIndex: number;
    video: Video;
    isMuted: boolean;
    isPlaying: boolean;
    togglePlay: () => void;
    toggleMute: () => void;
  }

  export interface RiyilsViewerControl {
    id: string;
    icon: React.ReactNode;
    ariaLabel: string;
    onClick: (ctx: RiyilsViewerControlContext) => void;
    visible?: boolean | ((ctx: RiyilsViewerControlContext) => boolean);
    active?: boolean | ((ctx: RiyilsViewerControlContext) => boolean);
    className?: string;
  }

  export interface AdConfig {
    interval?: number;
    shouldInject?: (index: number) => boolean;
    getAd: (index: number) => Video;
  }

  export interface RiyilsViewerProps {
    readonly videos: Video[];
    readonly initialIndex?: number;
    readonly onClose: () => void;
    readonly onVideoChange?: (index: number) => void;
    readonly translations?: Partial<RiyilsTranslations>;
    readonly progressBarColor?: string;
    readonly enableAutoAdvance?: boolean;
    readonly controls?: RiyilsViewerControl[];
    readonly adConfig?: AdConfig;
  }

  export interface ReactRiyilsTranslations {
    ctaButton: string;
    carouselAriaLabel: string;
    slideActiveAriaLabel: string;
    slideInactiveAriaLabel: string;
  }

  export interface RiyilsCarouselProps {
    readonly videos: Video[];
    readonly currentIndex?: number;
    readonly onVideoClick: (index: number) => void;
    readonly onVideoChange: (index: number) => void;
    readonly translations?: Partial<ReactRiyilsTranslations>;
    readonly enableAutoAdvance?: boolean;
  }

  export interface ExploreItem {
    id: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    videos: Video[];
  }

  export interface RiyilsExploreProps {
    readonly items: readonly ExploreItem[];
    readonly viewerProps?: Omit<RiyilsViewerProps, 'videos' | 'onClose'>;
    readonly onItemClick?: (item: ExploreItem) => void;
  }

  export interface RiyilsObserverProviderProps {
    children: React.ReactNode;
    onEvent?: (event: any) => void;
    logLevel?: 'info' | 'warn' | 'error';
  }

  export interface PlaybackControllerProviderProps {
    children: React.ReactNode;
  }

  export function RiyilsViewer(props: RiyilsViewerProps): React.ReactPortal | null;
  export function RiyilsCarousel(props: RiyilsCarouselProps): React.JSX.Element;
  export function RiyilsExplore(props: RiyilsExploreProps): React.JSX.Element;
  export function RiyilsObserverProvider(props: RiyilsObserverProviderProps): React.JSX.Element;
  export function PlaybackControllerProvider(props: PlaybackControllerProviderProps): React.JSX.Element;
  export function useGlobalRiyilsObserver(): any;
  export function useRiyilsObserver(): any;
  export const defaultRiyilsTranslations: RiyilsTranslations;
  export const defaultReactRiyilsTranslations: ReactRiyilsTranslations;
}

declare module 'react-riyils/dist/index.css';