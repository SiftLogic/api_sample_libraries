<?php
require_once 'Operations.php';
require_once 'patched_pemftp/ftp_class.php';

class OperationsTest extends PHPUnit_Framework_TestCase
{
  private $username;
  private $password;
  private $host;
  private $port;
  private $ftp;

  protected function setUp() 
  {
    $this->username = 'TestKey';
    $this->password = 'e261742d-fe2f-4569-95e6-312689d04903';
    $this->host = 9871;
    $this->port = 'localhost';
    $this->ftp = new Ftp(FALSE);


    $this->operations = new Operations($this->ftp, $this->username, $this->password, $this->host, 
                                       $this->port);
  }

  private function stubObjectWithOnce($name, $methods)
  {
    $stub = $this->getMock($name);

    foreach($methods as $key => $value){
      $stub->expects($this->once())
         ->method($key)
         ->will($this->returnValue($value));
    }

    return $stub;
  }

  public function testCorrectVariablesSetOnConstruction() 
  {
    $details = $this->operations->getConnectionDetails();

    $this->assertEquals($details['username'], $this->username);
    $this->assertEquals($details['password'], $this->password);
    $this->assertEquals($details['host'], $this->host);
    $this->assertEquals($details['port'], $this->port);

    $this->assertEquals($this->operations->ftp, $this->ftp);
  }

  public function testVariablesSetNonDefaultsOnConstruction() {
    $operations = new Operations($this->ftp, $this->username, $this->password);
    $details = $operations->getConnectionDetails();

    $this->assertEquals($details['host'], 'localhost');
    $this->assertEquals($details['port'], 21);

    $operations = new Operations($this->ftp, $this->username, $this->password, '', '');
    $details = $operations->getConnectionDetails();

    $this->assertEquals($details['host'], 'localhost');
    $this->assertEquals($details['port'], 21);
  }

  public function testSetServerError() {
    $this->setExpectedException('RuntimeException');

    $this->operations = new Operations($this->stubObjectWithOnce('Ftp', array(
      "SetServer" => FALSE,
      "quit" => TRUE
    )), $this->username, $this->password, $this->host, $this->port);

    $this->operations->init();
  }

  public function testConnectError() {
    $this->setExpectedException('RuntimeException');

    $this->operations = new Operations($this->stubObjectWithOnce('Ftp', array(
      "SetServer" => TRUE,
      "quit" => TRUE,
      "connect" => FALSE
    )), $this->username, $this->password, $this->host, $this->port);

    $this->operations->init();
  }

  public function testLoginError() {
    $this->setExpectedException('RuntimeException');

    $this->operations = new Operations($this->stubObjectWithOnce('Ftp', array(
      "SetServer" => TRUE,
      "quit" => TRUE,
      "connect" => TRUE,
      "login" => FALSE
    )), $this->username, $this->password, $this->host, $this->port);

    $this->operations->init();
  }

  public function testSetTypeError() {
    $this->setExpectedException('RuntimeException');

    $this->operations = new Operations($this->stubObjectWithOnce('Ftp', array(
      "SetServer" => TRUE,
      "quit" => TRUE,
      "connect" => TRUE,
      "login" => TRUE,
      "SetType" => FALSE
    )), $this->username, $this->password, $this->host, $this->port);

    $this->operations->init();
  }

  public function testPassiveError() {
    $this->setExpectedException('RuntimeException');

    $this->operations = new Operations($this->stubObjectWithOnce('Ftp', array(
      "SetServer" => TRUE,
      "quit" => TRUE,
      "connect" => TRUE,
      "login" => TRUE,
      "SetType" => TRUE,
      "Passive" => FALSE
    )), $this->username, $this->password, $this->host, $this->port);

    $this->operations->init();
  }

  public function testInitSuccess() {
    $stub = $this->stubObjectWithOnce('Ftp', array(
      "SetServer" => TRUE,
      "connect" => TRUE,
      "login" => TRUE,
      "SetType" => TRUE,
      "Passive" => TRUE
    ));

    $stub->expects($this->once())
         ->method('SetServer')
         ->with($this->host);
    $stub->expects($this->once())
         ->method('login')
         ->with($this->username, $this->password);
    $stub->expects($this->once())
         ->method('SetType')
         ->with(FTP_AUTOASCII);
    $stub->expects($this->once())
         ->method('Passive')
         ->with(TRUE);

    $this->operations = new Operations($stub, $this->username, $this->password, $this->host, 
                                       $this->port);

    $this->assertEquals($this->operations->init(), TRUE);
  }
}
?>