#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

/**
 * Demonstrates how the operations object can be used. It is better to require the operation.js file
 * your code directly for increased flexibility.
 * 1. Uploads the specified file.
 * 2. Polls the server until the results are complete.
 * 3. Downloads the results to the specified location.
 **/
var argv = require('yargs')
  .usage('Usage: $0 -f [file name] -l [download location] -k [key] -p [password]')
  .example('$0 -f /tmp/test.csv -l /tmp -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903', 
           'Upload test.csv, process it and download the results to /tmp')
  .demand(['f', 'l', 'k', 'p'])
  .describe({
    f: 'The absolute file path of the upload file',
    l: 'The absolute location of where the results file should be placed',
    k: 'The key name defined in the manage api keys section',
    p: 'The password defined in the manage api keys section',
    poll: 'The number of seconds to poll for'
  })
  .argv;

var Operations = require('./operations');

// Once uploaded download the results and quit once done.
var operations = new Operations(argv.k, argv.p, argv.poll, function(err, name) {
  if (err) {
    throw err;
  }

  console.log('Now downloading', name);
  operations.download(argv.l + name, function(err) {
    if (err) {
      throw err;
    }

    console.log('Downloaded', name, 'into', argv.l);
    operations.quit(function(err) {
      if (err) {
        throw err;
      }
    });
  });
}).init();

operations.upload(argv.f, function(err) {
  if (err) {
    throw err;
  }

  console.log(argv.f, 'was uploaded.');
});