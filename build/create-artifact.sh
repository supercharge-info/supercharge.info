#!/usr/bin/env bash


VERSION=`git tag -l --sort=v:refname | tail -1`
NEXUS_URL="https://redshiftsoft.com/nexus/repository/releases"
ARTIFACT="supercharge.info-${VERSION}.tgz"

tar --create --verbose --gzip --file ${ARTIFACT} --directory=webcontent-built .
