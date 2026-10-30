#!/usr/bin/env bash
# Called only by deploy.sh under the production deployment lock.
set -euo pipefail
umask 077

bootstrap=/srv/bluesteam/bootstrap
marker=/srv/bluesteam/shared/local-bootstrap-complete
if [[ -f "$marker" ]]; then
  echo 'Local data already imported; preserving production data.'
  exit 0
fi

test -s "$bootstrap/local.dump"
test -s "$bootstrap/media.tar.gz"
test -s "$bootstrap/SHA256SUMS"
(cd "$bootstrap" && sha256sum --check SHA256SUMS)

# Never overwrite a database or media tree that already contains production data.
tables=$(docker exec bluesteam_db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT count(*) FROM pg_tables WHERE schemaname = '\''public'\''"')
if [[ "$tables" != 0 ]] || [[ -n "$(find /srv/bluesteam/media -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo 'Bootstrap requires an empty database and media directory; refusing to overwrite data.' >&2
  exit 1
fi

docker exec -i bluesteam_db sh -c 'pg_restore --single-transaction --exit-on-error --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$bootstrap/local.dump"
tar --extract --gzip --file "$bootstrap/media.tar.gz" --directory /srv/bluesteam/media --no-same-owner
install -m 600 "$bootstrap/SHA256SUMS" "$marker"
echo 'Imported the local database and server media once. Future releases will not seed.'
