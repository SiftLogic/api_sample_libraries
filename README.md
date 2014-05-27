SiftLogic FTP APIs
==================

Each implementation is contained within an evironment folder which describes the implementation in more detail. Currently, there are 6 planned environments:

* .Net
* Java
* Node.js (<code>make run-node</code>) ✔
* PHP (<code>make run-php</code>) ✔
* Python
* Ruby

*test_data.csv* is an example file that can be run for each test. Specifically, the make run tests in this folder use this file.

Building Batraquomancy
======================

Currently, all files are just compressed into seperate .zip archives (Windows friendly):
<pre>
  <code>
    make zip-all
  </code>
</pre>

