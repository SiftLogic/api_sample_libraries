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
  var operations, username, password, onProcessed, operationsFromInit;
  beforeEach(function() {
    username = 'TestKey';
    password = 'e261742d-fe2f-4569-95e6-312689d04903';
    onProcessed = stub();

    operations = new Operations(username, password, null, onProcessed);

    stub(operations, 'JSFtp').returns({
      on: stub(),
      get: stub(),
      put: stub(),
      list: stub(),
      destroy: stub(),
      setDebugMode: stub(),

      raw: {
        quit: stub()
      },

      socket: {
        writable: true
      }
    });
    operationsFromInit = operations.init();
  });

  var calledOnceWith = function(_stub /*arg1, arg2,...*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    expect(_stub.calledOnce).to.be.true;
    expect(_stub.calledWith.apply(_stub, args)).to.be.true;
  };

  it('should set the username, password, onProcessed and JSFtp from instantiation', function() {
    operations = new Operations(username, password, null, onProcessed);

    expect(operations.username).to.equal(username);
    expect(operations.password).to.equal(password);
    expect(operations.onProcessed).to.deep.equal(onProcessed);
    expect(operations.JSFtp).to.deep.equal(JSFtp);
  });

  it('should set POLL_EVERY to 300000 by default and the number of ms when custom', function() {
    expect(operations.POLL_EVERY).to.equal(300000);
    
    operations = new Operations(username, password, 2, onProcessed);
    expect(operations.POLL_EVERY).to.equal(2000);
  });

  describe('init', function() {
    beforeEach(function() {
      stub(console, 'log');
    });

    afterEach(function() {
      console.log.restore();
    });

    it('should return the main object', function() {
      expect(operationsFromInit).to.deep.equal(operations);
    });

    it('should set the username, password and set debugMode to true', function() {
      calledOnceWith(operations.JSFtp, {
        user: operations.username,
        pass: operations.password,
        debugMode: true
      });
    });

    it('should watch jsftp_debug calling watchUpload only upon getting a file upload message and',
    function() {
      stub(operations, 'watchUpload');

      calledOnceWith(operations.ftp.on, 'jsftp_debug');

      operations.ftp.on.args[0][1]('test', {code: 225});

      expect(operations.watchUpload.calledOnce).to.be.false;

      operations.ftp.on.args[0][1]('response', {code: 225});

      expect(operations.watchUpload.calledOnce).to.be.false;

      var file = 'source_sample_subscriber_data_20140519_0004.csv';
      operations.ftp.on.args[0][1]('response', {
        code: 226,
        text: '226 closing data connection; File upload success; ' + file
      });

      calledOnceWith(operations.watchUpload, file);
    });

    it('should show a polling message', function() {
      stub(operations, 'watchUpload');
      operations.POLL_EVERY = 60000;

      operations.ftp.on.args[0][1]('response', {
        code: 226,
        text: ''
      });

      calledOnceWith(console.log, 'Polling every', 1, 'minutes:');
    });

    it('should call onProcessed with the error text when the code 550', function() {
      var text = '550 Insufficient credits (Upload ID: 5c835271b08622f30a125a421c8da0bf)';
      operations.ftp.on.args[0][1]('response', {
        code: 550,
        text: text
      });

      calledOnceWith(operations.onProcessed, text);
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
      var filename = 'test.csv',
          callback = stub();

      operations.init().upload(filename, callback);

      var serverLocation = '/import_' + operations.username + '_default_config/' + filename;
      calledOnceWith(operations.ftp.put, filename, serverLocation, callback);
    });
  });

  describe('watchUpload', function() {
    var filename;
    beforeEach(function() {
      stub(operations, 'reConnect');
      stub(console, 'log');

      filename = 'test1.csv';
      stub(operations, 'toDownloadFormat').returns(filename);
    });

    afterEach(function() {
      console.log.restore();
    });

    it('should set debugMode to false', function() {
      operations.watchUpload();

      calledOnceWith(operations.ftp.setDebugMode, false);
    });

    it('should list the complete directory', function() {
      operations.watchUpload();

      calledOnceWith(operations.ftp.list, '/complete');
    });

    describe('list callback', function() {
      it('should print that the data is formatted when the expected file is found and calls ' +
         'onProcessed and not reConnect', function() {
        operations.watchUpload();

        operations.ftp.list.args[0][1](false, 'test0.csv\n' + filename + 'test2.csv');

        calledOnceWith(console.log, filename, 'found.');
        calledOnceWith(onProcessed, false, filename);

        expect(operations.reConnect.called).to.be.false;
      });

      it('should call onProcessed and does not reconnect', function() {
        var error = 'ERROR: AUTHENTICATION ERROR';

        operations.watchUpload();

        operations.ftp.list.args[0][1](error);

        calledOnceWith(onProcessed, error);
        expect(operations.reConnect.called).to.be.false;
      });

      it('should print a not found message and then recalls watchUpload in some amount of time ' +
         'and reconnects', function() {
        var clock = sinon.useFakeTimers();

        operations.watchUpload(filename);

        operations.ftp.list.args[0][1](false, 'test0.csv\ntest2.csv');
        calledOnceWith(console.log, 'Waiting for results file', filename, '...');

        stub(operations, 'watchUpload');

        clock.timeouts[1].func();

        calledOnceWith(operations.watchUpload, filename);
        expect(operations.reConnect.calledOnce).to.be.true;
      });
    });

    it('should call reconnect when the socket is not writable', function() {
      operations.ftp.socket.writable = false;

      operations.watchUpload(filename);

      expect(operations.reConnect.calledOnce).to.be.true;
    });
  });

  describe('reConnect', function() {
    it('should call destroy', function() {
      operations.reConnect();

      expect(operations.ftp.destroy.calledOnce).to.be.true;
    });

    it('should instantiate a new jsftp object with no debug mode', function() {
      operations.reConnect();

      expect(operations.JSFtp.calledTwice).to.be.true;
      expect(operations.JSFtp.calledWith({
        user: operations.username,
        pass: operations.password
      })).to.be.true;
    });
  });

  describe('download', function() {
    it('should call ftp get with the file name, destination directory and callback', function() { 
      var filename = 'test/test.csv',
          callback = stub();

      operations.download(filename, callback);

      calledOnceWith(operations.ftp.get, '/complete/test.zip', 'test/test.zip', callback);
    });
  });

  describe('quit', function() {
    it('should call ftp raw\'s quit with the sent in callback', function() {
      var callback = stub();

      operations.quit(callback);

      calledOnceWith(operations.ftp.raw.quit, callback);
    });
  })
});