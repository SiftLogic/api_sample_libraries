<?php
require_once 'Operations.php';

class OperationsTest extends PHPUnit_Framework_TestCase
{
  private $username;

  protected function setUp() {
    $this->$username = 'TestKey';

    $this->$operations = new Operations($this->$username);
  }

  public function correctVariablesSetOnConstruction() {
    $this->assertEquals($this->$operations->$username, $this->$username);
  }
}
?>