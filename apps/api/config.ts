export const config = {
  crawler: {
    delay: {
      seed: 30,
      video: 5,
      keyword: 120,
    },
  },
  user: {
    max: {
      daily: {
        tokens: 100,
        crawlerJobs: 10,
      },
    },
  },
} as const;
