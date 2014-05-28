using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using System.Collections.Specialized;
using System.Threading.Tasks;

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
        private string port;

        public int pollEvery;

        /// <summary>
        /// The constructor adds properties to the object which are used in init.
        /// <param name="username">The username to get into the ftp server.</param>
        /// <param name="password">The password to get into the ftp server.</param>
        /// <param name="host">The host to connect to.</param>
        /// <param name="host">The port to connect to.</param>
        /// <param name="pollEvery">Number of seconds to poll for.</param>
        /// </summary>
        public Operations(string username, string password, string host = "localhost", string port = "21", int pollEvery = 300)
        {
            this.username = username;
            this.password = password;
            this.host = host;
            this.port = port;
            this.pollEvery = pollEvery;
        }

        /// <summary>
        /// Returns
        /// <value>an ordered dictionary of the username, password, host and port.</value>
        /// </summary>
        public OrderedDictionary ConnectionDetails
        {
            get {
                OrderedDictionary dictionary = new OrderedDictionary();
                dictionary.Add("username", username);
                dictionary.Add("password", password);
                dictionary.Add("host", host);
                dictionary.Add("port", port);

                return dictionary;
            }
        }


    }
}
