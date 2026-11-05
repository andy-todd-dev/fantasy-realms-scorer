#!/bin/sh
# Adds Gluestack components, for example: npm run ui:add -- modal
#
# The Gluestack CLI sets legacy-peer-deps in .npmrc on every install. That stops npm reporting peer
# conflicts and installing peers, including the preset Jest needs, so it's removed again here.
# This also runs if the add fails, as the CLI may already have written the setting by then.

npx gluestack-ui@5.0.3 add "$@" --use-npm
add_status=$?

rm -f .npmrc
npm install
install_status=$?

if [ "$add_status" -ne 0 ]; then
  exit "$add_status"
fi
exit "$install_status"
