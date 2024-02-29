export const config = {
  seeds: { default: 1, max: 5 },
  branches: { default: 1, max: 5 },
  depth: { default: 1, max: 5 },
  delay: {
    seed: { default: 0, max: 10 },
    video: { default: 0, max: 5 },
  },
} as const;
