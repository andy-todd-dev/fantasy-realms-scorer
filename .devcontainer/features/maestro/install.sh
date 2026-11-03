#!/bin/sh
set -e

archive="$(mktemp)"
curl --fail --location --silent --show-error \
  "https://github.com/mobile-dev-inc/maestro/releases/download/cli-${VERSION}/maestro.zip" \
  --output "$archive"
unzip -qo "$archive" -d /usr/local
rm -f "$archive"
