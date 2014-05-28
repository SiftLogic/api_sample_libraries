C# FTP APIs
===========

This demonstrates how to connect to the ftp server with C#. You will need to know your apikey and password which can be found in the UI: API Keys -\> Manage -\> Actions -\> Access Details. Once you
have that you can try the main.php file for an upload demo. For example:

Build
=====

Using Visual Studio Express 2013 Edition, but newer or slightly older versions of Visual Studio should be able to load the solution file in \CSharpFTPExample fine.

Installation
============

All files are included with this distribution so no installation is needed.


Files And Folders
=================

* **CSharpFTPExample:** Visual Studio solution folder. The layout in the folder follows the standard Visual Studio solution layout.


Test Command Line Options:
Filled Test: -f file -l location -k key -p password --poll 2 --host localhost --port 21 --singleFile true
Defaults Test: -f file -l location -k key -p password
Display help: --help 