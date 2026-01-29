#!/bin/sh

docker compose -f docker-compose.prod.yml down && \
docker compose -f docker-compose.prod.yml pull && \
docker compose -f docker-compose.prod.yml --env-file .env.production up -d;