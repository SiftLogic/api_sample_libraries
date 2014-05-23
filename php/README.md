PHP FTP APIs
============
For how the main file works: <code>./main.php --help</code\>

**To Test: **phpunit --strict OperationsTest.php

Installation
============
All dependencies are installed via composer:
<pre>
  <code>
    php composer.phar install
  </code>
</pre>

Files And Folders
=================
* **main.php:** Example CLI that uploads a file, polls for it to complete, then downloads it.
* **Operations.php:** Class that controls server connections.
* **OperationsTest.php:** 100% code coverage unit tests of operations.js. It is recommended that you update this if you want to customize operations.js.
* **composer.json:** Standard [Composer](https://getcomposer.org/doc/01-basic-usage.md) specification file.
* **vendor:** Standard location of composer packages.
* **patched_pemftp:** FTP library. Only a few work, and there were a few customizations. See that README.