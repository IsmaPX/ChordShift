export interface InfiniteCarouselProps {
  items: { id: string; content: React.ReactNode }[];
  speed?: number;
  className?: string;
  direction?: 'left' | 'right';
}