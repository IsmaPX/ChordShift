export type CharacterItem = {
  id: string | number;
  image: string;
  name: string;
  role: string;
  color: string;
};

export type CharacterCarouselProps = {
  items: CharacterItem[];
  className?: string;
};
