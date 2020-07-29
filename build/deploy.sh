#!/bin/bash
#==============================================================================================
# Deploy
# ./build/deploy.sh <test|prod> [version]
#==============================================================================================

# exit script on any error
trap 'exit' ERR

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
WEB_APP_DIR="webcontent-built"


echo "##########################################################";
echo "ENV                = ${ENV}"
echo "VERSION            = ${VERSION}"
echo "WEB_APP_DIR        = ${WEB_APP_DIR}"
echo "- - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
echo "REMOTE_HOST        = ${REMOTE_HOST}"
echo "SSH_USER           = ${SSH_USER}"
echo "DIR_DEPLOY         = ${DIR_DEPLOY}"
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

DIR_BACKUP=${DIR_DEPLOY}_`date +'%Y_%m_%d_%H_%M_%S'`

remoteCommand "cp -R ${DIR_DEPLOY} ${DIR_BACKUP}"

rsync --progress \
      --recursive \
      --archive \
      --rsh ssh  "${WEB_APP_DIR}/" "${SSH_USER}"@"${REMOTE_HOST}":"${DIR_DEPLOY}"

remoteCommand "chown -R ${SSH_USER}:www-data ${DIR_DEPLOY}"
remoteCommand "chmod -R ug+rx ${DIR_DEPLOY}"
