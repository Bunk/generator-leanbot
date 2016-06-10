#!/bin/sh
set -e

if [ "$1" = "--watch" ]; then
  shift;
  exec nodemon -x "./bin/hubot $@"
else
  exec ./bin/hubot "$@"
fi
