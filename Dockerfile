FROM node:20-alpine

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  npm

ARG AUTH_SECRET=$AUTH_SECRET
# ARG NEXT_PUBLIC_AUTH_SECRET=$NEXT_PUBLIC_AUTH_SECRET

# ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXT_PUBLIC_AUTH_SECRET=$NEXT_PUBLIC_AUTH_SECRET
ENV AUTH_TRUST_HOST=$AUTH_TRUST_HOST
ENV NEXT_PUBLIC_SERVER_API_URL=$NEXT_PUBLIC_SERVER_API_URL

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm i husky tsup turbo typescript -g

WORKDIR /app

COPY . .

RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

CMD [ "npm", "run", "start" ]

EXPOSE 3000
