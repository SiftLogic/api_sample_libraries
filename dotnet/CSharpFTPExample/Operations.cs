﻿using System;
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
        public Boolean Init()
        {
            this.ftp = new WrappedWebClient();

            ftp.Credentials = new NetworkCredential(username, password);

            return true;
        }

        /// <summary>
        /// Uploads the given filename to the FTP server using the information sent into initialization.
        /// <param name="filename">The absolute path name of the file.</param>
        /// <value>true if this succeeded.</value>
        /// </summary>
        public Boolean Upload(string filename)
        {
            var type = "splitfile";
            var directory = "/import_" + username + "_" + type + "_config/";

            try
            {
                ftp.UploadFile("ftp://" + host + ':' + port + directory + new FileInfo(filename).Name, "STOR", filename);

                //string[] status = GetStatusDescription(ftp);
                //Console.WriteLine("Description: " + status[0] + " " + status[1]);
            }
            catch (Exception e)
            {
                throw new Exception(e + "");
            }

            return true;
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
        /// A way of extracting ftp responses from WebClient obtained from http://stackoverflow.com/a/6470446. Returns
        /// <value>An array in the form [<status code>, <description>]</value>
        /// </summary>
        private string[] GetStatusDescription(IWebClient client)
        {
            FieldInfo responseField = client.GetType().BaseType.GetField("m_WebResponse", BindingFlags.Instance | BindingFlags.NonPublic);

            if (responseField != null)
            {
                FtpWebResponse response = responseField.GetValue(client) as FtpWebResponse;

                if (response != null)
                {
                    return new string[] { (int)response.StatusCode + "", response.StatusDescription };
                }
                else
                {
                    throw new Exception("Error: Could not get the response from the server.");
                }
            }

            throw new Exception("Error: Could not get the response field from the server.");
        }
    }
}
