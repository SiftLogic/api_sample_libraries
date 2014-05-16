#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

var JSFtp = require("jsftp");

var f = new JSFtp({
  user:  'JacobsCompletelyMadKey',
  pass: '0014ccac-4f6b-4272-909a-e43de09da679'
});
f.setDebugMode(true);

var retrieveOnceDone = function(savedFile) {
  f.get('/complete/' + savedFile.replace('source_', 'archive_').replace('.csv', '.zip').replace('.txt', '.zip'), savedFile, function(err) {
    if (err){ 
      console.log(err);
      process.exit();
    };

    console.log('Done the process');
  });
};

f.on('jsftp_debug', function(eventType, data) {
  if (eventType === 'response' && data && data.code === 226){
    retrieveOnceDone(data.text.split('; ').slice(-1)[0]);
  }
});

f.put('/opt/scalemail/apps/smapi/test/data-sample/sample_subscriber_data.csv', '/import_JacobsCompletelyMadKey_default_config/sample_subscriber_data.csv', function(err) {
  if (err){ 
    console.log(err);
    process.exit();
  };
});