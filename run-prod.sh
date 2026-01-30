#!/bin/bash

docker compose -p ${DEPLOY_ENV:=staging} -f docker-compose.prod.yml --env-file .env.production down && \
docker compose -p ${DEPLOY_ENV:=staging} -f docker-compose.prod.yml --env-file .env.production pull && \
docker compose -p ${DEPLOY_ENV:=staging} -f docker-compose.prod.yml --env-file .env.production up -d;