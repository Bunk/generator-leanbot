/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('hubot:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompt({
        someOption: true
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      '.docker/usr/local/bin/entry.sh',
      '.docker/usr/local/bin/start.sh',

      'bin/hubot',
      'bin/hubot.cmd',

      'scripts/personality.js',

      '.babelrc',
      '.dockerignore',
      '.drone.yml',
      '.editorconfig',
      '.eslintrc.js',
      '.gitignore',
      'Dockerfile',
      'external-scripts.json',
      'hubot-scripts.json',
      'package.json',
      'README.md'
    ]);
  });
});
