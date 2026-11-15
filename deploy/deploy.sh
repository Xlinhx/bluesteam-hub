#!/usr/bin/env bash
set -euo pipefail
umask 077

release=$(realpath "${1:?Usage: deploy.sh /srv/bluesteam/releases/<sha-run-attempt>}")
if [[ ! "$release" =~ ^/srv/bluesteam/releases/[a-f0-9]{40}-[0-9]+-[0-9]+$ ]]; then
  echo 'Invalid release directory' >&2
  exit 1
fi

# A server-side lock also protects manual deployments, beyond Actions concurrency.
exec 9>/srv/bluesteam/shared/deploy.lock
flock -n 9 || { echo 'Another deployment is running' >&2; exit 1; }
test -s "$release/production.env"
chmod 600 "$release/production.env"
cd "$release"
compose=(docker compose --project-name bluesteam-prod --env-file "$release/production.env" -f compose.production.yaml)
"${compose[@]}" config --quiet

# Finish both image builds before replacing running application containers.
"${compose[@]}" build
if docker inspect bluesteam_db >/dev/null 2>&1; then
  backup="/srv/bluesteam/backups/$(date -u +%Y%m%dT%H%M%SZ)-$(basename "$release").sql.gz"
  docker exec bluesteam_db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$backup"
  test -s "$backup"
fi
if [[ -n "$(find /srv/bluesteam/media -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  tar -C /srv/bluesteam/media -czf "/srv/bluesteam/backups/$(date -u +%Y%m%dT%H%M%SZ)-$(basename "$release")-media.tar.gz" .
fi

"${compose[@]}" up -d --wait --wait-timeout 180 bluesteam_db
bash deploy/bootstrap-local.sh
"${compose[@]}" run --rm --no-deps bluesteam_backend node server/dist/database/migrate-cli.js
"${compose[@]}" run --rm --no-deps bluesteam_backend node server/dist/database/seeds/seed-cli.js --learner-pack-only
"${compose[@]}" up -d --wait --wait-timeout 180 bluesteam_backend
# Nginx resolves its upstream on startup: refresh it when the API container changes.
"${compose[@]}" up -d --no-deps --force-recreate --wait --wait-timeout 120 bluesteam_frontend
curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-all-errors \
  http://127.0.0.1:8010/api/v1/health/ready >/dev/null
curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-all-errors \
  http://127.0.0.1:3010/api/v1/health/ready >/dev/null
curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-all-errors \
  http://127.0.0.1:3010/ >/dev/null

install -m 600 "$release/production.env" /srv/bluesteam/shared/production.env
ln -sfn "$release" /srv/bluesteam/current
echo "Deployed $(basename "$release")"
