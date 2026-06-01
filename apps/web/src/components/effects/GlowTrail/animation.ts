export const trailColors = [
  '#ff6b9d',
  '#c445f6',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
];

export const trailVariants = {
  initial: { opacity: 0, scale: 0.5 },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  animate: (_i: number) => ({
    opacity: [0, 0.8, 0.4],
    scale: [0.5, 1, 0.5],
  }),
};

export function getTrailColor(index: number, color?: string): string {
  if (color) return color;
  return trailColors[index % trailColors.length];
}