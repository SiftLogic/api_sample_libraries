using System;
using System.Linq;
using System.Collections.Specialized;
using System.Net;
using System.IO;
using System.Reflection;

namespace CSharpFTPExample
{
    /// <summary>
    /// Used by the Program.cs file to load and download files. This can be directly required to integrate into
    /// your own .Net application.
    /// </summary>
    public class Operations
    {
        private string username;
        private string password;
        private string host;
        private int port;

        public string uploadFileName = null;
        public int pollEvery;
        public IWebClient ftp = null;

        /// <summary>
        /// The constructor adds properties to the object which are used in init.
        /// <param name="username">The username to get into the ftp server.</param>
        /// <param name="password">The password to get into the ftp server.</param>
        /// <param name="host">The host to connect to.</param>
        /// <param name="host">The port to connect to.</param>
        /// <param name="pollEvery">Number of seconds to poll for.</param>
        /// </summary>
        public Operations(string username, string password, string host = "localhost", int port = 21, int pollEvery = 300)
        {
            this.username = username;
            this.password = password;
            this.host = host;
            this.port = port;
            this.pollEvery = pollEvery;
        }

        /// <summary>
        /// Initializes the web client was initialized with the correct credentials. Returns
        /// <value>true if this succeeded.</value>
        /// </summary>
        public bool Init()
        {
            this.ftp = new WrappedWebClient();

            ftp.Credentials = new NetworkCredential(username, password);

            return true;
        }

        /// <summary>
        /// Uploads the specified file.
        /// <param name="filename">The location of the file to upload.</param>
        /// <param name="singleFile">If the file is uploaded in single file mode. Defaults to false.</param>
        /// <value>A Tuble in the form (<upload succeeded>, <message>)</value>
        /// </summary>
        public Tuple<bool, string> Upload(string file, bool singleFile = false)
        {
            var type = singleFile ? "default" : "splitfile";
            var directory = "/import_" + username + "_" + type + "_config/";

            try
            {
                var fileName = new FileInfo(file).Name;
                ftp.UploadFile("ftp://" + host + ':' + port + directory + fileName, file);

                var status = GetStatusDescription(ftp);
                if (status.Item1 == 226)
                {
                    uploadFileName = status.Item2.Split(';').Last().Trim();
                    return new Tuple<bool, string>(true, fileName + " has been uploaded as " + uploadFileName);
                }
                else
                {
                    return new Tuple<bool, string>(false, "Failed to extract filename from: " + status.Item2);
                }
            }
            catch (Exception exception)
            {
                return new Tuple<bool, string>(false, exception.Message);
            }
        }

        /// <summary>
        /// Returns
        /// <value>an ordered dictionary of the username, password, host and port.</value>
        /// </summary>
        public OrderedDictionary GetConnectionDetails()
        {
            OrderedDictionary dictionary = new OrderedDictionary();
            dictionary.Add("username", username);
            dictionary.Add("password", password);
            dictionary.Add("host", host);
            dictionary.Add("port", port);

            return dictionary;
        }

        /// <summary>
        /// A way of extracting ftp responses from WebClient modified from http://stackoverflow.com/a/6470446. Returns
        /// <value>A Tuple in the form (<status code>, <description>)</value>
        /// </summary>
        public virtual Tuple<int, string> GetStatusDescription(IWebClient client)
        {
            var type = client.GetType().BaseType;
            FieldInfo responseField = type.GetField("m_WebResponse", BindingFlags.Instance | BindingFlags.NonPublic);

            if (responseField != null)
            {
                FtpWebResponse response = responseField.GetValue(client) as FtpWebResponse;

                if (response != null)
                {
                    return new Tuple<int, string>((int)response.StatusCode, response.StatusDescription);
                }
                else
                {
                    throw new Exception("Could not get the status code and description from the server.");
                }
            }

            throw new Exception("Could not get the response field from the server.");
        }
    }
}
