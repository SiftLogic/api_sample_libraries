SiftLogic FTP APIs
==================

Each implementation is contained within an evironment folder which describes the implementation in more detail. Currently, there are 6 planned environments:

* .Net (no linux run, see dotnet/README.md) ✔
* Java
* Node.js (<code>make run-node</code>) ✔
* PHP (<code>make run-php</code>) ✔
* Python
* Ruby

**test.csv:** Is an example file that can be run for each test. Specifically, the make run-\<environment\> tests in this folder use this file.<br/>
**test_bad.csv:** Is an example file that causes a bad data error to be returned from processing.

Licenses
========

Most of the 3rd party libraries are installed via various package managers. Their licenses can be checked in the created package manager folder. For more details of this, look in each languages folder. 3rd Party library license info has been included though, please see:

* **PemFTP (PHP):** https://github.com/SiftLogic/api_sample_libraries/tree/master/patched_pemftp/README.md
* **Command Line Parser Library (.Net):** http://commandline.codeplex.com/license
* **Moq (.Net):** https://github.com/Moq/moq/blob/master/LICENSE

Building Batraquomancy
======================

Currently, all files are just compressed into seperate .zip archives (Windows friendly):
<pre>
  <code>
    make zip-all
  </code>
</pre>

Bug Reporting
=============

Any bugs should be logged as issues at https://github.com/SiftLogic/api_sample_libraries

Feature Requests
================

Should you have any feature requests, such as adding support for another language, please open an issue at https://github.com/SiftLogic/api_sample_libraries


