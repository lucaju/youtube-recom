// import { CrawlerJoDbbModel } from '@/db/schemas';
// import { startOfToday } from 'date-fns';

// export const getUserDailyTokens = async (owner: string) => {
//   const crawlerJobs = await CrawlerJoDbbModel.find({
//     owner,
//     createdAt: { $gte: startOfToday() },
//   }).select('keywords config');

//   const usedTokens = crawlerJobs.reduce((totalUsed, crawlerJob) => {
//     const tokens =
//       crawlerJob.keywords.length *
//       (crawlerJob.config.seeds ?? 1) *
//       (crawlerJob.config.branches ?? 1) *
//       (crawlerJob.config.depth ?? 1);
//     return totalUsed + tokens;
//   }, 0);

//   return {
//     crawlerJobs: crawlerJobs.length,
//     tokens: usedTokens,
//   };
// };

// if (currentUser.role !== 'admin') {
//   const usage = await getUserDailyTokens(currentUser.id);

//   if (usage.crawlerJobs >= 5) {
//     return {
//       status: 429,
//       body: { message: 'Maximum daily number of crawler jobs reached. Come back tomorrow.' },
//     };
//   }

//   if (usage.tokens >= 100) {
//     return {
//       status: 429,
//       body: {
//         message:
//           'Maximum daily number of tokens for crawler jobs reached. Come back tomorrow.',
//       },
//     };
//   }
// }
