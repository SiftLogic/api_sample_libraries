/**
 * Used by the main file to load and download files. This can be directly included to integrate into your own Node.js application.
 **/

var JSFtp = require('jsftp');

// The constructor adds the username and password to the object. 
// onProcessed: Called once the file is uploaded. Any errors while checking for upload completion will be sent as the first argument.
module.exports = function(username, password, onProcessed) {
  var self = {
    username: username,
    password: password,
    onProcessed: onProcessed,
    JSFtp: JSFtp,// Make testing what is sent to this possible
    ftp: null,

    POLL_EVERY: 300000// 5 minutes in ms
  };

  // Initializes JSFtp making it watch debug info.
  self.init = function() {
    self.ftp = new self.JSFtp({
      user:  self.username,
      pass: self.password,
      debugMode: true
    });

    self.ftp.on('jsftp_debug', function(eventType, data) {
      if (eventType === 'response' && data && data.code === 226){
        self.ftp.events = function(){};

        self.watchUpload(data.text.split('; ').slice(-1)[0]);
      }
    });

    return self;
  };

  // Takes a file name and transforms it to the download formatted version (zip)
  self.toDownloadFormat = function(filename) {
    if (!filename){
      return filename;
    }

    return filename.replace('source_', 'archive_')// Replace the first only
                   .replace(new RegExp('.csv$'), '.zip')
                   .replace(new RegExp('.txt$'), '.zip');
  };

  // Calls onProcessed once the given file has been loaded.
  self.watchUpload = function(name) {
    // Stop the earlier jsftp_debug listener, it interferes with this libraries ftp listing operations.
    self.ftp.setDebugMode(false);

    self.ftp.list('/complete', function(err, res) {
      if (err){
         self.onProcessed(err);
      }

      var formatted = self.toDownloadFormat(name);
      if (res && res.indexOf(formatted) > -1){
        console.log(formatted, 'found.');

        self.onProcessed(false, formatted);
      } else {
        console.log('Waiting for results file', formatted, '...');

        setTimeout(function() {
          self.watchUpload(name);
        }, self.POLL_EVERY);
      }
    });
  };

  // Uploads the given file, include the full pathname if not in the current directory. Note, the callback is called once the file is uploaded, not
  // after it has been processed. That is the onProcessed callback.
  self.upload = function(filename, callback) {
    self.ftp.put(filename, '/import_' + self.username + '_default_config/' + filename.split('/').pop(), callback);
  };

  // Downloads the given file, include the full pathname if not in the current directory. Calls callback once download is complete.
  self.download = function(filename, callback) {
    var filename = self.toDownloadFormat(filename);
    self.ftp.get('/complete/' + filename.split('/').pop(), filename, callback);
  };

  return self;
};