#!/usr/bin/env php
<?php
/**
 * Demonstrates how the operations object can be used. It is better to require the operation.js file
 * your code directly for increased flexibility.
 * 1. Uploads the specified file.
 * 2. Polls the server until the results are complete.
 * 3. Downloads the results to the specified location.
 */
error_reporting(-1);

require_once 'vendor/autoload.php';
require_once 'Operations.php';
require_once 'patched_pemftp/ftp_class.php';

// Define CLI options
$cmd = new Commando\Command();
$cmd->setHelp("" .
  "Usage: ./main.php -f [file name] -l [download location] -k [key] -p [password]\n" .
  "Example: ./main.php -f /tmp/test.csv -l /tmp -k TestKey -p e261742d-fe2f-4569-95e6-312689d049 --poll 10\n" .
  "         Upload test.csv, process it and download the results to /tmp, poll every 10s"
  ) 
->option('f')
    ->require()
    ->describedAs('The absolute file path of the upload file')
->option('l')
    ->require()
    ->describedAs('The absolute location of where the results file should be placed')
->option('k')
    ->require()
    ->describedAs('The key name defined in the manage api keys section')
->option('p')
    ->require()
    ->describedAs('The password defined in the manage api keys section')
->option('poll')
    ->describedAs('The number of seconds to poll for (default 300)')
->option('host')
    ->describedAs('The host to connect to (default localhost)')
->option('port')
    ->describedAs('The port to connect to (default 21)');

// Do not run any code while in help mode
if (!empty($cmd['k'])){
  $operations = new Operations(new Ftp(TRUE), $cmd['k'], $cmd['p'], $cmd['host'], $cmd['port']);
  $operations->init();
}
?>