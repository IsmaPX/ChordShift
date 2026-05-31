export type CarouselItem = {
  id: string | number;
  content: React.ReactNode;
};

export type BaseCarouselProps = {
  items: CarouselItem[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
  onItemChange?: (index: number) => void;
};
