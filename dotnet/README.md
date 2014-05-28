C# FTP APIs
===========

This demonstrates how to connect to the ftp server with C#. You will need to know your apikey and password which can be found in the UI: API Keys -\> Manage -\> Actions -\> Access Details. Once you
have that you can try the main.php file for an upload demo. For example:

Quick Start
===========

There is no isntallation step as all files have been included.

* **Load the solution into Visual Studio:** Open CSharpFTPExample\CSharpFTPExample.sln
* **Run the example:** With the solution open, click the start button
 * To configure command line options click on the CSharpFTPExample example properties->Debug->Edit Start Options
* **Run the tests:** With the solution open, TEST->Run->All Tests

Building
========

Using Visual Studio Express 2013 Edition, but newer or slightly older versions of Visual Studio should be able to load the solution file in \CSharpFTPExample fine. The build is already configured you just have to run it (F7).


Files And Folders
=================

* **CSharpFTPExample:** Visual Studio project folder (also contains the solution). Important files:
 * **CSharpFTPExample.csproj:** The project file used to load FTP example code
 * **CSharpFTPExample.sln:** The solution file for the entire project including the tests


A MINIMAL BUILD EXPLANATION NEEDED


Test Command Line Options:
Filled Test: -f file -l location -k key -p password --poll 2 --host localhost --port 21 --singleFile true
Defaults Test: -f file -l location -k key -p password
Display help: --help


For setting up unit tests:
http://msdn.microsoft.com/en-us/library/hh694602.aspx#BKMK_Unit_testing_overview

Note when running tests there may be an error:
*NuGet Package restore failed for project Miscellaneous Files: Value cannot be null or an empty string.
Parameter name: root.*
This is due to how I am structuring the project and does not affect the tests so don't worry about it.
