#!/bin/bash

export $(grep -v '^#' .env.production | xargs)

DB_CONTAINER_NAME="prod-db"
BACKUPS_FOLDER=".backups"
CURRENT_BACKUP_FOLDER=$BACKUPS_FOLDER/`date +%Y-%m-%d"_"%H-%M-%S`
RCLONE_REMOTE_NAME="s3"
RCLONE_REMOTE_FOLDER="the-good-corner-nov25"

echo "creating backup folder in $CURRENT_BACKUP_FOLDER"
mkdir -p $CURRENT_BACKUP_FOLDER

echo "Saving DB..."
docker exec -e PGPASSWORD=$DB_PASS $DB_CONTAINER_NAME pg_dumpall -c -U $DB_USER > $CURRENT_BACKUP_FOLDER/dump.sql

echo "syncing from local to remote..."
rclone sync $BACKUPS_FOLDER  $RCLONE_REMOTE_NAME:$RCLONE_REMOTE_FOLDER

echo "done !"
