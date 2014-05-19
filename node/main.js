#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

/**
 * Demonstrates how the operations object can be used. Just:
 * 1. Uploads a file
 * 2. Downloads the results for that file once complete
 **/

var Operations = require('./operations');

var FILE_NAME = '/opt/scalemail/apps/smapi/test/data-sample/sample_subscriber_data.csv',
    DOWNLOAD_LOCATION = '/home/jacob/Desktop/';

var operations = new Operations('TestKey', 'e261742d-fe2f-4569-95e6-312689d04903', function(err, name) {
  if (err) {
    throw err;
  }

  console.log('Now downloading', name);
  operations.download(DOWNLOAD_LOCATION + name, function(err) {
    if (err) {
      throw err;
    }

    console.log('Downloaded', name, 'into', DOWNLOAD_LOCATION);
    operations.quit(function(err){
      if (err) {
        throw err;
      }
    });
  });
}).init();

operations.upload(FILE_NAME, function(err) {
  if (err) {
    throw err;
  }

  console.log(FILE_NAME, 'was uploaded.')
});