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
  
  public $uploadedFileName;// Set on upload
  public $pollEvery;
  public $ftp;

  /**
   * The constructor adds opts to the object which are used in init.
   *
   * @param (ftp) An instance of ftp to use.
   * @param (username) The username to get into the ftp server.
   * @param (password) The password to get into the ftp server.
   * @param (host) The port to connect to. Defaults to localhost.
   * @param (port) The port to connect to. Defaults to 21.
   * @param (polling) Poll every polling seconds. Defaults to 300 (5 minutes) if falsey.
   */
  public function __construct(Ftp $ftp, $username, $password,
                              $host = 'localhost', $port = 21, $pollEvery = 300) 
  {
    $this->username = $username;
    $this->password = $password;
    $this->host = $host;
    $this->port = $port;
    $this->pollEvery = $pollEvery;

    if (empty($this->port)){
      $this->port = 21;
    }
    if (empty($this->host)){
      $this->host = 'localhost';
    }
    if (empty($this->pollEvery)){
      $this->pollEvery = 300;
    }

    $this->ftp = $ftp;
  }

  /**
   * Initializes the ftp object and logs in. Then goes to passive mode.
   *
   * @return TRUE if operations could be initialized.
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
   * @param (file) The location of the file to upload.
   *
   * @return An array of the format [<upload succeeded>, <message>].
   */
  public function upload($file)
  {
    $dir = "import_{$this->username}_default_config";

    $formatted = end(split('/', trim($file)));
    if($this->ftp->put($formatted, "$dir/$formatted")) {
      $response_message = $this->ftp->last_message();
      if (preg_match("/.* (.*)$/", $response_message, $parsed)) {
        $this->uploadedFileName = trim($parsed[1]);

        return array(TRUE, "$formatted has been uploaded as {$parsed[1]}\n");
      } else {
        return array(FALSE, "Failed to extract filename from: $response_message\n");
      }
    } else {
      $message = $this->ftp->last_message();
      return array(FALSE, "\nFile upload error: $message\n");
    }
  }

 /**
   * Polls every pollEvery seconds until the last uploaded file can be downloaded. Then downloads.
   *
   * @param (location) The absolute location to download the file to.
   *
   * @return An array [<download succeeded>, <message>].
   */
  public function download($location, $self = '')
  {
    // So that waitAndDownload can be stubbed in the tests
    if(empty($self)){
      $self = $this;
    }

    $listing = $self->ftp->nlist('/complete');
    if (empty($listing)){
      return array(FALSE, "The /complete directory does not exist.\n");
    }

    $location = preg_replace('/\/$/', '', $location);// Remove trailing slash if present

    $formatted = $self->getDownloadFileName();
    if (array_search($formatted, $listing)){
      if(!$self->ftp->get("/complete/$formatted", "$location/$formatted")){
        $message = $self->ftp->last_message();
        return array(FALSE, "\nFile download error: $message\n");
      };

      return array(TRUE, "$formatted downloaded to $location.\n");
    } else {
      return $self->waitAndDownload($self->pollEvery, $formatted, $location);
    }
  }

  /**
   * Wait the specified time then download the file. Useful for test stubbing.
   *
   * @param (time) The time in seconds to sleep for.
   * @param (file) The filename to download. Just need the filename, no path.
   * @param (location) The absolute location to download the file to.
   */
  public function waitAndDownload($time, $file, $location)
  {
    echo("Waiting for results file $file ...\n");

    sleep($time);

    // We could have been kicked off due to inactivity...
    $this->ftp->quit();
    if (!$this->init()){
      return array(FALSE, "Could not reconnect to the server.\n");
    }

    return $this->download($location);
  }

  /**
   * Closes the FTP connection properly. This should always be called at the end of a program using
   * this class.
   */
  public function quit()
  {
    $this->ftp->quit();
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

  /**
   * Retrieves the upload file name and transforms it to the download one. 
   *
   * @return The current download name of the current upload.
   */
  public function getDownloadFileName()
  {
    if (empty($this->uploadedFileName)){
      return $this->uploadedFileName;
    }

    $formatted = preg_replace('/source_/', 'archive_', $this->uploadedFileName, 1);

    if (strpos($formatted, '.csv') || strpos($formatted, '.txt')){
      $formatted = substr($formatted, 0, -4) .'.zip';
    }

    return $formatted;
  }
}
?>