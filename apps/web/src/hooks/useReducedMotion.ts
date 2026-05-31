import { useReducedMotion as fmUseReducedMotion } from 'framer-motion'

export const useReducedMotion = () => {
  const prefersReducedMotion = fmUseReducedMotion()

  return {
    reducedMotion: prefersReducedMotion,
    animationsEnabled: !prefersReducedMotion,
  }
}
