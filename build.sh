#!/usr/bin/env bash
VERSION=$(grep -o '"version": "[^"]*' ./package.json | grep -o '[^"]*$')
echo "Building version $VERSION"
docker buildx build --platform linux/amd64 -t rg.fr-par.scw.cloud/ironarachne/ironarachne:$VERSION .
echo "Done"
