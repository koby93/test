#!/bin/sh
set -eu
attempt=0
until mc alias set platform http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Object storage initialization timed out." >&2
    exit 1
  fi
  sleep 2
done
mc mb --ignore-existing "platform/$S3_BUCKET"
mc anonymous set none "platform/$S3_BUCKET"
