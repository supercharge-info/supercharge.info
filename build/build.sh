#!/usr/bin/env bash

# exit script on any error
trap 'exit' ERR

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