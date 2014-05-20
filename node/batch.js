#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

/**
 * Download and upload more than one file in parallel
 **/

var Operations = require('./operations');

var FILE_NAMES = [
      '/opt/scalemail/apps/smapi/test/data-sample/sample_subscriber_data.csv',
      '/opt/smuinew/test/csv_upload_files/mappings_email_only_with_header_01.csv',
      '/opt/smuinew/test/csv_upload_files/sample_utf8.csv'
    ],
    DOWNLOAD_LOCATION = '/home/jacob/Desktop/';

var operations = [];
for (var i = 0; i < 3; i += 1) {
  (function(i) {
    operations.push(new Operations('TestKey', 'e261742d-fe2f-4569-95e6-312689d04903', function(err, name) {
      if (err) {
        console.log(err);
      }

      console.log('Now downloading', name);
      operations[i].download(DOWNLOAD_LOCATION + name, function(err) {
        if (err) {
          console.log(err);
        }

        console.log('Downloaded', name, 'into', DOWNLOAD_LOCATION);
        operations[i].quit(function(err){
          if (err) {
            console.log(err);
          }
        });
      });
    }).init());
  })(i)
}

operations.forEach(function(operation, index) {
  operation.upload(FILE_NAMES[index], function(err) {
    if (err) {
      console.log(err);
    }

    console.log(FILE_NAMES[index], 'was uploaded.')
  });
});