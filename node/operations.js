/**
 * Used by the main file to load and download files. This can be directly required to integrate into
 * your own Node.js application.
 **/
var JSFtp = require('jsftp');

// The constructor adds opts to the object which are used in init.
// opts.username: The username to get into the ftp server
// opts.password: The password to get into the ftp server
// opts.host: The port to connect to. Defaults to localhost if falsey.
// opts.port: The port to connect to. Defaults to 21 if falsey.
// opts.polling: Poll every polling seconds. Defaults to 300 (5 minutes) if falsey.
module.exports = function(opts) {
  'use strict';
  
  var self = {
    username: opts.username,
    password: opts.password,
    host: opts.host || 'localhost',
    port: opts.port || 21,

    uploadedFileName: null,// Set on upload
    JSFtp: JSFtp,// Make testing what is sent to this possible
    ftp: null,

    POLL_EVERY: (opts.polling || 300) * 1000// convert seconds to milliseconds
  };

  // Initializes JSFtp in debug mode.
  self.init = function(callback) {
    self.ftp = new self.JSFtp({
      host: self.host,
      port: self.port,
      user:  self.username,
      pass: self.password,
      debugMode: true
    });

    return self;
  };

  // Takes a file name and transforms it to the results formatted version (zip).
  self.toDownloadFormat = function(filename) {
    if (!filename){
      return filename;
    }

    return filename.replace('source_', 'archive_')// Replace the first only
                   .replace(new RegExp('.csv$'), '.zip')
                   .replace(new RegExp('.txt$'), '.zip');
  };

  // Calls the callback once the last uploaded file (uploadedFileName) has been loaded or there is 
  // an error. Reconnects for every request to deal with the lost connections.
  self.watchUpload = function(callback) {
    // Stop the earlier jsftp_debug listener, it interferes with jsftp's libraries listing operation
    self.ftp.setDebugMode(false);

    if (self.ftp.socket.writable){
      self.ftp.list('/complete', function(err, res) {
        if (err){
          callback(err);
        }

        var formatted = self.toDownloadFormat(self.uploadedFileName);
        if (res && res.indexOf(formatted) > -1){
          console.log(formatted, 'found.');

          callback();
        } else {
          console.log('Waiting for results file', formatted, '...');

          setTimeout(function() {
            self.reConnect();
            self.watchUpload(callback);
          }, self.POLL_EVERY);
        }
      });
    } else {
      self.reConnect();
    }
  };

  // Recreates a connection.
  self.reConnect = function() {
    self.ftp.destroy();

    self.ftp = new self.JSFtp({
      host: self.host,
      port: self.port,
      user: self.username,
      pass: self.password
    });
  };

  // Uploads the given file, include the full pathname if not in the current directory. Making it
  // watch debug info until a file is successfully uploaded. singleFile specifies whether to upload
  // in singleFile mode, by default is false. If there is any errors calls the callback with the
  // error message.
  self.upload = function(filename, singleFile, callback) {
    self.ftp.on('jsftp_debug', function(eventType, data) {
      if (eventType === 'response' && data){
        // File was successfully uploaded
        if (data.code === 226){
          self.ftp.events = function(){};
          self.uploadedFileName = data.text.split('; ').slice(-1)[0].trim();

          callback();
        // A error with the file or backend specifically. e.g. Not enough credits
        } else if (data.code === 550){
          callback(data.text);
        }
      }
    });

    var type = (singleFile) ? 'default' : 'splitfile';
    var serverLocation ='/import_' + self.username + '_'+type+'_config/' +filename.split('/').pop();
    self.ftp.put(filename, serverLocation);
  };

  // Polls until the results can be downloaded. Calls the callback once download is complete or on
  // error.
  self.download = function(location, callback) {
    self.watchUpload(function(err) {
      if (err){
        return callback(err);
      }
      location = location.replace(new RegExp('\/$'), '');// Remove trailing slash if present

      var filename = self.toDownloadFormat(self.uploadedFileName);
      self.ftp.get('/complete/' + filename, location + '/' + filename, callback);
    })
  };

  // Closes the ftp connection, should be done after each download. Calls the callback on complete.
  self.quit = function(callback) {
    self.ftp.raw.quit(callback);
  };

  return self;
};