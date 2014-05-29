using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using CSharpFTPExample;
using System.Net;
using System.Collections;
using System.Collections.Specialized;
using Moq;

namespace CsharpFTPExampleTests
{
    [TestClass]
    public class OperationsTests
    {
        private Mock<Operations> mockOperations;
        private Operations operations;
        private Mock<IWebClient> mockWebClient;
        private IWebClient client;

        private string username = "TestKey";
        private string password = "e261742d-fe2f-4569-95e6-312689d04903";
        private string host = "bacon";
        private int port = 9871;
        private int pollEvery = 1;

        private string file = @"C:\WINDOWS\Temp\test.csv";

        [TestInitialize]
        public void Setup()
        {
            mockOperations = new Mock<Operations>(username, password, host, port, pollEvery);
            operations = mockOperations.Object;

            mockWebClient = new Mock<IWebClient>();
            client = mockWebClient.Object;
        }

        [TestMethod]
        public void Instantiation_AllVariables_SetsValues()
        {
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

        // Init

        [TestMethod]
        public void Init_Default_SetsFTPAndCredentializes()
        {
            Assert.IsTrue(operations.Init());

            var credentials = operations.ftp.Credentials.GetCredential(null, "");
            Assert.AreEqual(credentials.Password, password);
            Assert.AreEqual(credentials.UserName, username);

            Assert.IsTrue(operations.ftp is WebClient);
        }

        // Upload

        [TestMethod]
        public void Upload_BadStatusCode_SplitFileNameIsUploaded()
        {
            var ftpMessage = "500 The command was not accepted.";
            mockWebClient.Setup(m => m.UploadFile(null, null));
            mockOperations.Setup(m => m.GetStatusDescription(client)).Returns(new Tuple<int, string>(500, ftpMessage));

            operations.Init();
            operations.ftp = client;

            Assert.AreEqual(operations.Upload(file), new Tuple<bool, string>(false, "Failed to extract filename from: " + ftpMessage));
            Assert.AreEqual(operations.uploadFileName, null);
        }

        [TestMethod]
        public void Upload_SplitFile_SplitFileNameIsUploaded()
        {
            var ftpMessage = "226 closing data connection; File upload success; source.csv";
            mockWebClient.Setup(m => m.UploadFile("ftp://bacon:9871/import_TestKey_splitfile_config/test.csv", file));
            mockOperations.Setup(m => m.GetStatusDescription(client)).Returns(new Tuple<int, string>(226, ftpMessage));

            operations.Init();
            operations.ftp = client;

            Assert.AreEqual(operations.Upload(file), new Tuple<bool, string>(true, "test.csv has been uploaded as source.csv"));

            mockWebClient.VerifyAll();
            mockOperations.VerifyAll();
            Assert.AreEqual(operations.uploadFileName, "source.csv");
        }

        [TestMethod]
        public void Upload_SingleFile_SingleFileNameIsUploaded()
        {
            var ftpMessage = "226 closing data connection; File upload success; source.csv";
            mockWebClient.Setup(m => m.UploadFile("ftp://bacon:9871/import_TestKey_default_config/test.csv", file));
            mockOperations.Setup(m => m.GetStatusDescription(client)).Returns(new Tuple<int, string>(226, ftpMessage));

            operations.Init();
            operations.ftp = client;

            Assert.AreEqual(operations.Upload(file, true), new Tuple<bool, string>(true, "test.csv has been uploaded as source.csv"));

            mockWebClient.VerifyAll();
            mockOperations.VerifyAll();
            Assert.AreEqual(operations.uploadFileName, "source.csv");
        }
    }
}

