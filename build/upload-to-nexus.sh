#!/usr/bin/env bash

# Exit if any command fails.
set -e

VERSION=`git tag -l --sort=v:refname | tail -1`
NEXUS_URL="https://redshiftsoft.com/nexus/repository/releases"
ARTIFACT="supercharge.info-${VERSION}.tgz"
NEXUS_UPLOAD_URL="${NEXUS_URL}/com/redshiftsoft/supercharge/map/${ARTIFACT}"


read -r nexusUser nexusPassword < ~/.nexus-credentials
if curl --user "${nexusUser}:${nexusPassword}" --output /dev/null --silent --head --fail "${NEXUS_UPLOAD_URL}"; then
  echo "*********** ARTIFACT ALREADY EXISTS IN NEXUS: ${NEXUS_UPLOAD_URL}";
  exit;
else
  echo "********** OK: URL does NOT already exist, uploading: ${NEXUS_UPLOAD_URL}"
  curl --fail --user "${nexusUser}:${nexusPassword}" --upload-file ${ARTIFACT} ${NEXUS_UPLOAD_URL}
  rm ${ARTIFACT}  
fi