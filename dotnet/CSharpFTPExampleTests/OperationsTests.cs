using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using CSharpFTPExample;
using System.Net;
using System.Collections;
using System.Collections.Specialized;
using Moq;

namespace CsharpFTPExampleTest
{
    [TestClass]
    public class OperationsTests
    {
        private string username = "TestKey";
        private string password = "e261742d-fe2f-4569-95e6-312689d04903";
        private string host = "localhost";
        private int port = 9871;
        private int pollEvery = 1;

        [TestMethod]
        public void Instantiation_AllVariables_SetsValues()
        {
            Operations operations = new Operations(username, password, host, port, pollEvery);

            Assert.AreEqual(operations.pollEvery, pollEvery);

            var details = operations.GetConnectionDetails();
            Assert.AreEqual(details["username"], username);
            Assert.AreEqual(details["password"], password);
            Assert.AreEqual(details["host"], host);
            Assert.AreEqual(details["port"], port);
        }

        [TestMethod]
        public void Instantiation_DefaultValues_SetsValues()
        {
            Operations operations = new Operations(username, password);

            Assert.AreEqual(operations.pollEvery, 300);

            var details = operations.GetConnectionDetails();
            Assert.AreEqual(details["host"], "localhost");
            Assert.AreEqual(details["port"], 21);
        }

        [TestMethod]
        public void Init_Default_SetsFTPAndCredentializes()
        {
            Operations operations = new Operations(username, password);

            operations.init();

            var credentials = operations.ftp.Credentials.GetCredential(null, "");
            Assert.AreEqual(credentials.Password, password);
            Assert.AreEqual(credentials.UserName, username);

            Assert.IsTrue(operations.ftp is WebClient);
        }
    }
}

