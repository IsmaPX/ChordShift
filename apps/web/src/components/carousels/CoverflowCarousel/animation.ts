export const coverflowVariants = {
  center: {
    scale: 1,
    rotateY: 0,
    zIndex: 10,
    opacity: 1,
    filter: 'brightness(1)',
  },
  left: {
    scale: 0.7,
    rotateY: 30,
    zIndex: 5,
    opacity: 0.6,
    filter: 'brightness(0.5)',
    x: -100,
  },
  right: {
    scale: 0.7,
    rotateY: -30,
    zIndex: 5,
    opacity: 0.6,
    filter: 'brightness(0.5)',
    x: 100,
  },
  hidden: {
    scale: 0.3,
    opacity: 0,
    zIndex: 1,
  },
};
