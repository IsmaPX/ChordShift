export type GalleryImage = {
  id: string | number;
  url: string;
  alt: string;
  category?: string;
  width: number;
  height: number;
};

export type GalleryProps = {
  images: GalleryImage[];
  className?: string;
  onImageClick?: (image: GalleryImage) => void;
};
