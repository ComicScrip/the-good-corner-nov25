FROM dhi.io/node:24.12-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY .env ./.env
COPY src ./src
COPY tsconfig.json ./tsconfig.json

CMD ["npm", "run", "dev"]