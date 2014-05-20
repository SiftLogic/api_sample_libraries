/**
 * Tests all functions in operations.js.
 * NOTE: mocha needs to be installed as global: npm install -g mocha
 **/

var sinon = require('sinon'),
    stub = sinon.stub,
    chai = require('chai'),
    expect = chai.expect;

var Operations = require('./operations'),
    JSFtp = require('jsftp');

describe('Operations', function() {
  var operations, username, password, onProcessed;
  beforeEach(function() {
    username = 'TestKey';
    password = 'e261742d-fe2f-4569-95e6-312689d04903';
    onProcessed = stub();

    operations = new Operations(username, password, null, onProcessed);
  });

  it('should set the name, password, onProcessed and JSFtp from instantiation', function() {
    expect(operations.username).to.equal(username);
    expect(operations.password).to.equal(password);
    expect(operations.onProcessed).to.deep.equal(onProcessed);
    expect(operations.JSFtp).to.deep.equal(JSFtp);

    expect(operations.ftp).to.be.null;
  });

  it('should set POLL_EVERY to 300000 by default and the number of ms when custom', function() {
    expect(operations.POLL_EVERY).to.equal(300000);
    
    operations = new Operations(username, password, 2, onProcessed);
    expect(operations.POLL_EVERY).to.equal(2000);
  });

  describe('init', function() {
    var on, main;
    beforeEach(function() {
      on = stub();

      stub(operations, 'JSFtp').returns({on: on});

      main = operations.init();

      stub(console, 'log');
    });

    afterEach(function() {
      console.log.restore();
    });

    it('should return the main object', function() {
      expect(main).to.deep.equal(operations);
    });

    it('should set the username, password and set debugMode to true', function() {
      expect(operations.JSFtp.calledOnce).to.be.true;
      expect(operations.JSFtp.calledWith({
        user: operations.username,
        pass: operations.password,
        debugMode: true
      })).to.be.true;
    });

    it('should watch jsftp_debug calling watchUpload only upon getting a file upload message',
    function() {
      stub(operations, 'watchUpload');

      expect(on.calledOnce).to.be.true;
      expect(on.calledWith('jsftp_debug')).to.be.true;

      on.args[0][1]('test', {code: 225});

      expect(operations.watchUpload.calledOnce).to.be.false;

      on.args[0][1]('response', {code: 225});

      expect(operations.watchUpload.calledOnce).to.be.false;

      var file = 'source_sample_subscriber_data_20140519_0004.csv';
      on.args[0][1]('response', {
        code: 226,
        text: '226 closing data connection; File upload success; ' + file
      });

      expect(operations.watchUpload.calledOnce).to.be.true;
      expect(operations.watchUpload.calledWith(file)).to.be.true;
    });

    it('should also show a polling every', function() {
      stub(operations, 'watchUpload');
      operations.POLL_EVERY = 60000;

      on.args[0][1]('response', {
        code: 226,
        text: ''
      });

      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWith('Polling every', 1, 'minutes:')).to.be.true;
    });

    it('should call unprocessed with the error text when the code 550', function() {
      var text = '550 Insufficient credits (Upload ID: 5c835271b08622f30a125a421c8da0bf)';
      on.args[0][1]('response', {
        code: 550,
        text: text
      });

      expect(operations.onProcessed.calledOnce).to.be.true;
      expect(operations.onProcessed.calledWith(text)).to.be.true;
    });
  });

  describe('toDownloadFormat', function() {
    it('should do no reformatting when the file type is not .txt or .csv and there is no source_',
    function() {
      expect(operations.toDownloadFormat()).to.equal();
      expect(operations.toDownloadFormat('')).to.equal('');
      expect(operations.toDownloadFormat('test_test.doc')).to.equal('test_test.doc');
    });

    it('should replace just source_ with archive_', function() {
      expect(operations.toDownloadFormat('source_test.doc')).to.equal('archive_test.doc');
    });

    it('should replace just the first source_ and just the last .csv with .zip', function() {
      expect(operations.toDownloadFormat('source_source_test.csv.csv')).to
       .equal('archive_source_test.csv.zip');
    });

    it('should replace just the first source_ and just the last .txt with .zip', function() {
      expect(operations.toDownloadFormat('source_source_test.txt.txt')).to
       .equal('archive_source_test.txt.zip');
    });

    it('should deal with a .csv followed by a .txt', function() {
      expect(operations.toDownloadFormat('source_source_test.csv.txt')).to
       .equal('archive_source_test.csv.zip');
    });
  });

  describe('upload', function() {
    it('should call ftp put with the file name and destination directory and callback', function() { 
      var put = stub(),
          filename = 'test.csv',
          callback = stub();

      stub(operations, 'JSFtp').returns({
        on: stub(),
        put: put
      });

      operations.init().upload(filename, callback);

      expect(put.calledOnce).to.be.true;
      var serverLocation = '/import_' + operations.username + '_default_config/' + filename;
      expect(put.calledWith(filename, serverLocation, callback)).to.be.true;
    });
  });

  describe('watchUpload', function() {
    var list, setDebugMode, filename;
    beforeEach(function() {
      list = stub();
      setDebugMode = stub();

      stub(operations, 'JSFtp').returns({
        on: stub(),
        list: list,
        setDebugMode: setDebugMode
      });

      stub(console, 'log');

      filename = 'test1.csv';
      stub(operations, 'toDownloadFormat').returns(filename);

      operations.init();
    });

    afterEach(function() {
      console.log.restore();
    });

    it('should set debugMode to false', function() {
      operations.watchUpload();

      expect(setDebugMode.calledOnce).to.be.true;
      expect(setDebugMode.calledWith(false)).to.be.true;
    });

    it('should list the complete directory', function() {
      operations.watchUpload();

      expect(list.calledOnce).to.be.true;
      expect(list.calledWith('/complete')).to.be.true;
    });

    it('should have a callback that prints that the data is formatted when the expected file is' +
       'found and calls onProcessed', function() {
      operations.watchUpload();

      list.args[0][1](false, 'test0.csv\n' + filename + 'test2.csv');

      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWith(filename, 'found.')).to.be.true;

      expect(onProcessed.calledOnce).to.be.true;
      expect(onProcessed.calledWith(false, filename)).to.be.true;
    });

    it('should have a callback that calls onProcessed with the given error', function() {
      var error = 'ERROR: AUTHENTICATION ERROR';

      operations.watchUpload();

      list.args[0][1](error);

      expect(onProcessed.calledOnce).to.be.true;
      expect(onProcessed.calledWith(error)).to.be.true;
    });

    it('should have a callback that prints a not found message and thenrecalls watchUpload in some'+
       'amount of time', function() {
      var clock = sinon.useFakeTimers();

      operations.watchUpload(filename);

      list.args[0][1](false, 'test0.csv\ntest2.csv');
      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWith('Waiting for results file', filename, '...')).to.be.true;

      stub(operations, 'watchUpload');

      clock.timeouts[1].func();

      expect(operations.watchUpload.calledOnce).to.be.true;
      expect(operations.watchUpload.calledWith(filename)).to.be.true;
    });
  });

  describe('download', function() {
    it('should call ftp get with the file name, destination directory and callback', function() { 
      var get = stub(),
          filename = 'test/test.csv',
          callback = stub();

      stub(operations, 'JSFtp').returns({
        on: stub(),
        get: get
      });

      operations.init().download(filename, callback);

      expect(get.calledOnce).to.be.true;
      expect(get.calledWith('/complete/test.zip', 'test/test.zip', callback)).to.be.true;
    });
  });

  describe('quit', function() {
    it('should call ftp raw\'s quit with the sent in callback', function() {
      var quit = stub(),
          callback = stub();

      stub(operations, 'JSFtp').returns({
        on: stub(),
        raw: {
          quit: quit
        }
      });
      operations.init();

      operations.quit(callback);

      expect(quit.calledOnce).to.be.true;
      expect(quit.calledWith(callback)).to.be.true;
    });
  })
});