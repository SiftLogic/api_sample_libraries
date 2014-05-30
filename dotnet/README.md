.Net FTP APIs
=============

This demonstrates how to connect to the ftp server with .Net using C#. You will need to know your apikey and password which can be found in the UI: API Keys -\> Manage -\> Actions -\> Access Details. Once you have that you can try the executable file for an upload demo. For example:
<pre>
  <code>
    CSharpFTPExample\bin\Release\CSharpFTPExample.exe -f test.csv -l C:\WINDOWS\Temp\ -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903 --poll 10
  </code>
</pre>
The CLI is described in more detail with <code>CSharpFTPExample\bin\Release\CSharpFTPExample.exe</code>

It is recommended to include the Operations file and use the methods in there to customize your process. The methods are described in file. If you want to cut down on code, this only requires the 
[CommandLineParser](https://commandline.codeplex.com/) library.

Quick Start
===========

There is no installation step as all necessary files have been included.

* **Run a the EXE on a CLI:** <code>CSharpFTPExample\bin\Release\CSharpFTPExample.exe</code>
* **Load the solution into Visual Studio:** Open CSharpFTPExample\CSharpFTPExample.sln
* **Run the example:** With the solution open, click the start button
 * To configure command line options click on the CSharpFTPExample example properties->Debug->Edit Start Options
* **Run the tests:** With the solution open, TEST->Run->All Tests. Make sure to build (F7) first.
 * Note only with tests there may be an error: "NuGet Package restore failed for project Miscellaneous Files: Value cannot be null or an empty string. Parameter name: root." This is a NuGet configuration issue and is not a testing error.

Building
========

Make sure you are running C# \>= <b>5.0</b>.

Using Visual Studio Express 2013 Edition, but newer or slightly older versions of Visual Studio should be able to load the solution file in \CSharpFTPExample fine. The build is already configured you just have to run it (F7). We are using NuGet (built into modern Visual Studios) for package management.


Files And Folders
=================

* **CSharpFTPExample/:** Visual Studio project folder of the main code (also contains the solution). Important files and folders:
 * **bin/:** Contains the debug and release information and executables.
 * **packages/:** Contains packages used across the entire solution.
 * **Properties/:** Basic information about the project such as copyrights
 * **CSharpFTPExample.csproj:** The project file used to load FTP example code.
 * **CSharpFTPExample.sln:** The solution file for the entire project including the tests.
 * **Program.cs:** Used to run the program, accepts command line arguments.
 * **IWebClient.cs:** An interface around System.Net.WebClient. Since most mocking libraries including what we are using (Moq) cannot test non virtual methods, interfaces like this must be created around concrete classes.
 * **WrappedWebClient.cs:** The implementation for IWebClient.cs, just calls WebClient's methods without modification.
 * **packages.config:** XML Specification of the libraries this program uses.

* **CSharpFTPExampleTests/:** Visual Studio project folder of the tests for the main code. Important files and folders:
 * **bin/:** Contains the debug and release executables.
 * **Properties/:** Basic information about the project such as copyrights
 * **CSharpFTPExample.csproj:** The project file used to load FTP example test code.
 * **OperationsTests.cs:** Tests for the Operations class
 * **packages.config:** XML Specification of the libraries this program uses
