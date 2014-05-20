/**
 * Used by the main file to load and download files. This can be directly required to integrate into
 * your own Node.js application.
 **/

var JSFtp = require('jsftp');

// The constructor adds the username and password to the object. Also: 
// polling: Poll every polling seconds. Defaults to 300 if falsey.
// onProcessed: Called once the file is uploaded. Any errors while checking for upload or processing
//              completion will be sent as the first argument.
module.exports = function(username, password, polling, onProcessed) {
  var self = {
    username: username,
    password: password,
    onProcessed: onProcessed,
    JSFtp: JSFtp,// Make testing what is sent to this possible
    ftp: null,

    POLL_EVERY: (polling || 300) * 1000// convert seconds to milliseconds
  };

  // Initializes JSFtp making it watch debug info until a file is successfully uploaded. If there is
  // any errors calls onProccessed with error message.
  self.init = function() {
    self.ftp = new self.JSFtp({
      user:  self.username,
      pass: self.password,
      debugMode: true
    });

    self.ftp.on('jsftp_debug', function(eventType, data) {
      if (eventType === 'response' && data){
        // File was successfully uploaded
        if (data.code === 226){
          self.ftp.events = function(){};

          console.log('Polling every', self.POLL_EVERY/60000, 'minutes:');
          self.watchUpload(data.text.split('; ').slice(-1)[0]);
        // A error with the file or backend specifically. e.g. Not enough credits
        } else if (data.code === 550){
          self.onProcessed(data.text);
        }
      }
    });

    return self;
  };

  // Takes a file name and transforms it to the download formatted version (zip).
  self.toDownloadFormat = function(filename) {
    if (!filename){
      return filename;
    }

    return filename.replace('source_', 'archive_')// Replace the first only
                   .replace(new RegExp('.csv$'), '.zip')
                   .replace(new RegExp('.txt$'), '.zip');
  };

  // Calls onProcessed once the given file has been loaded or there is an error.
  self.watchUpload = function(name) {
    // Stop the earlier jsftp_debug listener, it interferes with jsftp's libraries listing operation
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

  // Uploads the given file, include the full pathname if not in the current directory. Note, the 
  // callback is called once the file is uploaded, not after it has been processed.
  self.upload = function(filename, callback) {
    var serverLocation = '/import_' + self.username + '_default_config/' +filename.split('/').pop();
    self.ftp.put(filename, serverLocation, callback);
  };

  // Downloads the given file, include the full pathname if not in the current directory. Calls the
  // callback once download is complete.
  self.download = function(filename, callback) {
    var filename = self.toDownloadFormat(filename);
    self.ftp.get('/complete/' + filename.split('/').pop(), filename, callback);
  };

  // Closes the ftp connection, should be done after each download. Calls the callback on complete.
  self.quit = function(callback) {
    self.ftp.raw.quit(callback);
  };

  return self;
};