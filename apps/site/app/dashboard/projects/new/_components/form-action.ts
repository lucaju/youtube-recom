'use server';

import { auth } from '@/auth';
import { serverApi } from '@/serverApi';
import { ClientInferRequest } from '@ts-rest/core';
import { redirect } from 'next/navigation';
import { contract } from 'youtube-recommendation-crawler-api/dist';
import { z } from 'zod';
import { FormSchema } from './form';

type CreateProjectRequest = ClientInferRequest<typeof contract.projects.create>;

export const createProject = async (data: z.infer<typeof FormSchema>) => {
  const session = await auth();
  if (!session) return { error: 'Not authenticated' };

  // transform data
  const hour = data.time.hour;
  const minute = data.time.minute < 10 ? `0${data.time.minute}` : data.time.minute;

  const dataToSubmit: CreateProjectRequest['body'] = {
    title: data.title,
    description: data.description === '' ? undefined : data.description,
    keywords: data.keywords,
    crawlerConfig: {
      seeds: data.seeds,
      branches: data.branches,
      depth: data.depth,
      language: data.language === '' ? undefined : data.language,
      country: data.country === '' ? undefined : data.country,
    },
    schedule: {
      frequency: data.frequency,
      time: `${hour}:${minute}`,
      timezone: data.timezone === '' ? undefined : data.timezone,
    },
    preferences: {
      notification: {
        email: data.notifyEmail,
        discord: data.notifyDiscordChannel,
      },
    },
  };

  // create project
  const { status, body } = await serverApi.projects.create({
    headers: { authorization: `Bearer ${session.user.token}` },
    body: dataToSubmit,
  });

  if (status === 400 || status === 401 || status === 500) {
    return { error: body.message };
  }

  redirect('/dashboard/projects');
};
