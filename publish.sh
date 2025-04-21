#!/usr/bin/env bash
VERSION=$(grep -o '"version": "[^"]*' ./package.json | grep -o '[^"]*$')
echo "Publishing version $VERSION"
docker push rg.fr-par.scw.cloud/ironarachne/ironarachne:$VERSION
echo "Done"
