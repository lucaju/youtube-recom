import { contract } from '@/contract';
import pkg from '@/package.json' assert { type: 'json' };
import { generateOpenApi } from '@ts-rest/open-api';

const PORT = process.env.PORT ?? 3000;
// const AUTH_API_ENV = process.env.AUTH_API_ENV ?? 'localhost';

// type API_ENV = 'localhost' | 'stage' | 'dev' | 'prod';
// const API_ENV = 'localhost';

// const serverUrl =
//   API_ENV === 'prod'
//     ? 'https://auth-api.lincsproject.ca'
//     : API_ENV === 'stage' || API_ENV === 'dev'
//     ? `https://auth-api.${API_ENV}.lincsproject.ca`
//     : `http://localhost:${PORT}`;

const serverUrl = `http://localhost:${PORT}`;

export const openApiDocument = generateOpenApi(
  contract,
  {
    info: {
      title: 'LINCS Auth-API',
      description: `Source: [${serverUrl}/open-api.json](${serverUrl}/open-api.json)`,
      version: pkg.version,
    },
    servers: [{ url: serverUrl, description: 'localhost' }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    externalDocs: {
      description: 'Project Reposity',
      // url: 'https://gitlab.com/calincs/infrastructure/auth-api',
    },
  },
  { setOperationId: true },
);
