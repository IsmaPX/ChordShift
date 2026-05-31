export type CoverflowItem = {
  id: string | number;
  image: string;
  title: string;
};

export type CoverflowCarouselProps = {
  items: CoverflowItem[];
  className?: string;
};
