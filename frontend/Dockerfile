FROM node:24.11-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY .env ./
COPY src ./
COPY public ./
COPY next.config.ts ./
COPY next-env.d.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

CMD ["npm", "run", "dev"]