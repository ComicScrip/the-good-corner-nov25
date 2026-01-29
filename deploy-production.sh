#!/bin/sh

docker compose -f docker-compose.prod.yml --env-file .env.production down && \
docker compose -f docker-compose.prod.yml --env-file .env.production pull && \
docker compose -f docker-compose.prod.yml --env-file .env.production up -d;