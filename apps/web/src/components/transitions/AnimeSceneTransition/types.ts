export interface AnimeSceneTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export type TransitionVariant = 'fade' | 'slide' | 'wave' | 'curtain' | 'blur' | 'morph';