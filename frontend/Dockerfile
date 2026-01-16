FROM node:24.11-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY .env ./
COPY src ./
COPY public ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

RUN npm run codegen

CMD ["npm", "run", "dev"]