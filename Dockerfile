FROM node:23-alpine AS base

FROM base AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=production
RUN npm run build

FROM base AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/.next/standalone ./
COPY --from=build /usr/src/app/.next/static ./.next/static
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]