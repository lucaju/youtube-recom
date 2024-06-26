import { initClient } from '@ts-rest/core';
import { contract } from 'youtube-recommendation-crawler-api/dist';

export const serverApi = initClient(contract, {
  baseUrl: process.env.NEXT_PUBLIC_SERVER_API_URL,
  baseHeaders: {},
});
