export interface AnimatedLightboxProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  interval?: number;
}