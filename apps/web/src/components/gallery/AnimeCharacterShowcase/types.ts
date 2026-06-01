export interface AnimeCharacterShowcaseProps {
  characters: {
    id: string;
    name: string;
    imageUrl: string;
    role?: string;
    color?: string;
  }[];
  className?: string;
}