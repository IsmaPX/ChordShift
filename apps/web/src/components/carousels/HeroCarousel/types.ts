export type HeroCarouselItem = {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  color: string;
};

export type HeroCarouselProps = {
  items: HeroCarouselItem[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
};
