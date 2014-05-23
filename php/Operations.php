<?php
/**
 * Contains all the operations to upload, poll and download files. Unlike the Node.js scripts, this
 * operates synchronously.
 */
class Operations
{
  private $username;
  private $password;
  private $host;
  private $port;

  public $ftp;

  /**
   * The constructor adds opts to the object which are used in init.
   *
   * @param (ftp) An instance of ftp to use.
   * @param (username) The username to get into the ftp server.
   * @param (password) The password to get into the ftp server.
   * @param (host) The port to connect to. Defaults to localhost.
   * @param (port) The port to connect to. Defaults to 21.
   */
  public function __construct(Ftp $ftp, $username, $password, $host = 'localhost', $port = 21) 
  {
    $this->username = $username;
    $this->password = $password;
    $this->host = $host;
    $this->port = $port;

    if (empty($this->port)){
      $this->port = 21;
    }
    if (empty($this->host)){
      $this->host = 'localhost';
    }

    $this->ftp = $ftp;
  }

  /**
   * Initializes the ftp object and logs in. Then goes to passive mode.
   *
   * @return Returns true if operations could be initialized.
   */
  public function init()
  {
    if (!$this->ftp->SetServer($this->host)) {
        $this->ftp->quit();
        throw new RuntimeException("Could not set the server.\n");
    }

    if (!$this->ftp->connect()) {
      $this->ftp->quit();
      throw new RuntimeException("Cannot connect to $this->host:$this->port.\n");
    }

    if (!$this->ftp->login($this->username, $this->password)) {
      $this->ftp->quit();
      throw new RuntimeException(
        "Login failed with username:password $this->username:$this->password.\n"
      );
    }

    if (!$this->ftp->SetType(FTP_AUTOASCII)) {
      $this->ftp->quit();
      throw new RuntimeException("Could not set type to auto ASCII.\n");
    }

    if (!$this->ftp->Passive(TRUE)) {
      $this->ftp->quit();
      throw new RuntimeException("Could not change to passive mode.\n");
    }

    return TRUE;
  }

  /**
   * Changes to the upload directory then uploads the specified file.
   *
   * @return Returns an array [<upload succeeded>, <message>]
   */
  public function upload($file)
  {
    $dir = "import_{$this->username}_default_config";

    $this->ftp->chdir($dir);
    if($this->ftp->put($file, $dir .'/'. $file)) {
      $response_message = $this->ftp->last_message();
      if (preg_match("/.* (.*)$/", $response_message, $parsed)) {
          return array(TRUE, "$file has been uploaded as {$parsed[1]}\n");
      } else {
          return array(FALSE, "Failed to extract filename from: $response_message\n");
      }
    } else {
      $message = strtolower($this->ftp->last_message());
      return array(FALSE, "\nFile upload error: $message\n");
    }
  }

  /**
   * Returns the connections details. Namely, username, password, host and port.
   *
   * @return Associative array of the username, password, host and port.
   */
  public function getConnectionDetails() 
  {
    return array(
      "username" => $this->username,
      "password" => $this->password,
      "host" => $this->host,
      "port" => $this->port,
    );
  }
}
?>