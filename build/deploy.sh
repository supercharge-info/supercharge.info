#!/bin/bash
#==============================================================================================
# Deploy
#
# ./build/deploy.sh <test|prod> [version]
#
# If version is specified we download that version from nexus and deploy it. If version is
# not specified we deploy from the local 'webcontent-build' directory.
#
#==============================================================================================

# Exit on any error.
set -e

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# validate command line args
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ENV=$1
VERSION=$2
if [[ "$1" = "test" ]]; then
    REMOTE_HOST="test.supercharge.info"
    DIR_DEPLOY="/var/www/test.supercharge.info"
elif [[ "$1" = "prod" ]]; then
    REMOTE_HOST="super01.supercharge.info"
    DIR_DEPLOY="/var/www/supercharge.info"
else
    echo "unknown environment: ${ENV}";
    echo "usage: deploy.sh <test|prod> [version]";
    exit;
fi


SSH_USER="tomcat"
DIR_STAGE=${DIR_DEPLOY}_`date +'%Y_%m_%d_%H_%M_%S'`

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Download artifact from nexus if a version was specified.
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
WEB_APP_DIR="webcontent-built"
if [[ "$VERSION" != "" ]]; then
    NEXUS_URL="https://redshiftsoft.com/nexus/repository/releases"
    ARTIFACT="supercharge.info-${VERSION}.tgz"
    NEXUS_DOWNLOAD_URL="${NEXUS_URL}/com/redshiftsoft/supercharge/map/${ARTIFACT}"

    TEMP_DIR="/tmp/super_$$"
    WEB_APP_DIR="${TEMP_DIR}/webcontent-built"
    mkdir -p ${WEB_APP_DIR}
    cd ${TEMP_DIR}

    read -r nexusUser nexusPassword < ~/.nexus-credentials
    curl --fail  --user "${nexusUser}:${nexusPassword}" -o ${TEMP_DIR}/d.tgz ${NEXUS_DOWNLOAD_URL}

    tar -xvf d.tgz -C ${WEB_APP_DIR}
fi


echo "##########################################################";
echo "ENV                = ${ENV}"
echo "VERSION            = ${VERSION}"
echo "NEXUS_DOWNLOAD_URL = ${NEXUS_DOWNLOAD_URL}"
echo "WEB_APP_DIR        = ${WEB_APP_DIR}"
echo "- - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
echo "REMOTE_HOST        = ${REMOTE_HOST}"
echo "SSH_USER           = ${SSH_USER}"
echo "DIR_DEPLOY         = ${DIR_DEPLOY}"
echo "DIR_STAGE          = ${DIR_STAGE}"
echo "##########################################################";


# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# confirmation
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -

echo "Is that correct [yes/no]?"
read confirmation

if [ "${confirmation}" != "yes" ]; then
    echo "exiting";
    exit;
fi

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# functions
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function remoteCommand {
  echo "EXEC REMOTE COMMAND: $1";
  ssh ${SSH_USER}@${REMOTE_HOST} "$1"
}

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# deploy
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -


remoteCommand "mkdir ${DIR_STAGE}"

scp -r ${WEB_APP_DIR}/. ${SSH_USER}@${REMOTE_HOST}:${DIR_STAGE}/

remoteCommand "rm -rf ${DIR_DEPLOY}_OLD"
remoteCommand "mv ${DIR_DEPLOY} ${DIR_DEPLOY}_OLD"

remoteCommand "mv ${DIR_STAGE} ${DIR_DEPLOY}"

rm --recursive --preserve-root ${WEB_APP_DIR}

remoteCommand "chown -R ${SSH_USER}:www-data ${DIR_DEPLOY}"
remoteCommand "chmod -R ug+rx ${DIR_DEPLOY}"

