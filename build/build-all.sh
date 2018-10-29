#!/usr/bin/env bash

# Exit on any error.
set -e

#
# This increments version in package.json, commits and pushes that change, and tags the commit with that version.
#
npm version --message "RELEASE: %s" patch
git push origin HEAD --tags

#
# Actually create the packaged webcontent-build directory.
#
npm run clean
npm run package

#
# Zip it and upload to nexus.
#
./build/create-artifact.sh
./build/upload-to-nexus.sh