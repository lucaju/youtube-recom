import { contract } from '@/contract';
import { auth } from '@/server/middleware/auth';
import * as notitication from '@/server/notification';
import { initServer } from '@ts-rest/express';
import { CrawlerResult } from 'youtube-recommendation-crawler';

const s = initServer();

export const routerNotifications = s.router(contract.tests.notifications, {
  email: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser } }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const body = notitication.email.composer({
        title: 'test',
        date: new Date(),
        results: mockResult,
      });
      await notitication.email.sendEmail({ recipient: currentUser, body });

      return { status: 200, body: { message: 'ok' } };
    },
  },
  discord: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser } }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      await notitication.discord.sendToDiscord('Project Title', mockResult[0]);

      return { status: 200, body: { message: 'ok' } };
    },
  },
});

const mockResult: CrawlerResult[] = [
  {
    date: new Date('2024-03-02T05:01:46.450Z'),
    keyword: 'rain',
    videos: [
      {
        id: 'vTUmcpQkYbU&pp',
        title:
          'Rain Sounds For Sleeping - 99% Instantly Fall Asleep With Rain And Thunder Sound At Night',
        adCompanion: {
          domain: 'go.getjobber.com',
          title: 'Try Jobber',
        },
        channel: {
          id: 'www.youtube.com',
          name: 'Rain Sound Natural',
        },
        comments: -1,
        crawlerResults: {
          collectedAt: new Date('2024-03-02T05:01:57.070Z'),
          depth: 0,
          recommended: 1,
        },
        datePublished: new Date('2024-03-01T15:44:18.000Z'),
        description:
          'Do you struggle to fall asleep at night? Are you in need of some soothing and relaxing rain sounds to calm your mind and body? If so, this video is perfect f...',
        duration: 'PT0M0S',
        hastags: ['Rain Sounds for Sleeping'],
        likes: 581,
        paid: false,
        recommendations: [
          {
            title:
              '🔴 Heavy Rain and Thunder Sounds for Sleeping - Black Screen | Thunderstorm Sleep Sounds, Live Stream',
            id: '65e2b2d25017d464ced95e5d',
          },
          {
            title:
              'Fall Asleep With The Soothing Sounds Of Rain And Thunder | Study, Relax with Rain Sounds',
            id: '65e2b2d25017d464ced95e5e',
          },
          {
            title:
              '3 Hours of Gentle Night Rain, Rain Sounds for Sleeping - Dark Screen to Beat insomnia, Relax, Study',
            id: '65e2b2d25017d464ced95e5f',
          },
          {
            title:
              'You &amp; Me: Relaxing Piano Music &amp; Soft Rain Sounds For Sleep &amp; Relaxation',
            id: '65e2b2d25017d464ced95e60',
          },
          {
            title:
              'Heavy Stormy Night with Torrential Rainstorm &amp; Very Huge Thunder ⚡⛈ Thunderstorm Sounds for Sleeping',
            id: '65e2b2d25017d464ced95e61',
          },
        ],
        uploadDate: new Date('2024-03-01T15:44:18.000Z'),
        views: 18666,
      },
      {
        id: '0V0SKiiFZMs',
        title:
          '🔴 Heavy Rain and Thunder Sounds for Sleeping - Black Screen | Thunderstorm Sleep Sounds, Live Stream',
        adCompanion: {
          domain: 'fr.starbucks.ca',
          title: 'Trouvez Votre Starbucks',
        },
        channel: {
          id: 'www.youtube.com',
          name: 'Pure Sleeping Vibes',
        },
        comments: -1,
        crawlerResults: {
          collectedAt: new Date('2024-03-02T05:02:04.164Z'),
          depth: 1,
          recommended: 1,
        },
        datePublished: new Date('2022-10-11T18:12:00.000Z'),
        description:
          'My first classy Black Screen Heavy Rain and Thunder Sounds for Sleeping composition as a live stream here at Pure Sleeping Vibes. All recordings of this Thun...',
        duration: 'PT0M0S',
        hastags: ['#heavyrainandthunder', '#thunderstorm', '#blackscreen'],
        likes: 30892,
        paid: false,
        recommendations: [
          {
            title:
              '🔴 Sleep Fast with Pure Nature Rain and Incredible Present Thunder Sounds | Black Screen',
            id: '65e2b2d25017d464ced95e63',
          },
          {
            title: 'Sleep to Ocean Thunderstorm Sounds to Wake Up Refreshed and Relaxed',
            id: '65e2b2d25017d464ced95e64',
          },
          {
            title:
              '🔴 Gentle Night Rain - BLACK SCREEN to Sleep FAST, Rain Sounds for Sleeping &amp; Beat Insomnia',
            id: '65e2b2d25017d464ced95e65',
          },
          {
            title:
              '🔴 Powerful Rain and Thunder Sounds for Sleeping | Black Screen Rainstorm - Sleep Sounds',
            id: '65e2b2d25017d464ced95e66',
          },
          {
            title: '🔴 Rain on a Porch, Black Screen 🌧️⬛ • Live 24/7 • No mid-roll ads',
            id: '65e2b2d25017d464ced95e67',
          },
        ],
        uploadDate: new Date('2022-10-11T18:12:00.000Z'),
        views: 10951,
      },
      {
        id: '8F5ikqOi4Ps',
        title:
          'Fall Asleep With The Soothing Sounds Of Rain And Thunder | Study, Relax with Rain Sounds',
        channel: {
          id: 'www.youtube.com',
          name: 'Rain Sound Natural',
        },
        comments: -1,
        crawlerResults: {
          collectedAt: new Date('2024-03-02T05:02:10.208Z'),
          depth: 1,
          recommended: 1,
        },
        datePublished: new Date('2024-03-01T16:26:39.000Z'),
        description:
          'Do you struggle to fall asleep at night? Are you in need of some soothing and relaxing rain sounds to calm your mind and body? If so, this video is tailored ...',
        duration: 'PT0M0S',
        hastags: ['#RainSounds', '#SleepSounds', '#ASMR'],
        likes: 37,
        paid: false,
        recommendations: [
          {
            title:
              'Rain Sounds For Sleeping - 99% Instantly Fall Asleep With Rain And Thunder Sound At Night',
            id: '65e2b2d25017d464ced95e69',
          },
          {
            title:
              'healing music for the heart and blood vessels 🌿 calms the nervous system and pleases the soul',
            id: '65e2b2d25017d464ced95e6a',
          },
          {
            title:
              'Heavy Rain to Sleep FAST or Relax, Study, Block Noise - Rain on The Roof in the Foggy Forest',
            id: '65e2b2d25017d464ced95e6b',
          },
          {
            title:
              'Heavy Stormy Night with Torrential Rainstorm &amp; Very Huge Thunder ⚡⛈ Thunderstorm Sounds for Sleeping',
            id: '65e2b2d25017d464ced95e6c',
          },
          {
            title:
              'Sounds Of RAIN And Thunder For Sleep - Rain Sounds For Relaxing Your Mind And Sleep Tonight - ASMR',
            id: '65e2b2d25017d464ced95e6d',
          },
        ],
        uploadDate: new Date('2024-03-01T16:26:39.000Z'),
        views: 1021,
      },
    ],
  },
];
