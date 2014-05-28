using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using CSharpFTPExample;
using System.Collections;
using System.Collections.Specialized;

namespace CsharpFTPExampleTest
{
    [TestClass]
    public class OperationsTests
    {
        private string username = "TestKey";
        private string password = "e261742d-fe2f-4569-95e6-312689d04903";
        private string host = "localhost";
        private string port = "9871";
        private int pollEvery = 1;

        [TestMethod]
        public void Instantiation_AllVariables_SetsValues()
        {
            Operations operations = new Operations(username, password, host, port, pollEvery);

            Assert.AreEqual(operations.pollEvery, pollEvery);

            var details = operations.ConnectionDetails;
            Assert.AreEqual(details["username"], username);
            Assert.AreEqual(details["password"], password);
            Assert.AreEqual(details["host"], host);
            Assert.AreEqual(details["port"], port);
        }
    }
}

