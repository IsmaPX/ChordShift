export const slideVariants = {
  left: {
    initial: { x: 50, opacity: 0 },
    animate: (custom: number) => ({ x: 0, opacity: 1, transition: { delay: custom, duration: 0.6 } })
  },
  right: {
    initial: { x: -50, opacity: 0 },
    animate: (custom: number) => ({ x: 0, opacity: 1, transition: { delay: custom, duration: 0.6 } })
  },
  up: {
    initial: { y: 50, opacity: 0 },
    animate: (custom: number) => ({ y: 0, opacity: 1, transition: { delay: custom, duration: 0.6 } })
  },
  down: {
    initial: { y: -50, opacity: 0 },
    animate: (custom: number) => ({ y: 0, opacity: 1, transition: { delay: custom, duration: 0.6 } })
  },
};
