export interface MusicCarouselProps {
  items: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    duration?: string;
  }[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}