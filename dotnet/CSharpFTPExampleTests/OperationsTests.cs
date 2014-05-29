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
        private string username = "TestKey";
        private string password = "e261742d-fe2f-4569-95e6-312689d04903";
        private string host = "bacon";
        private int port = 9871;
        private int pollEvery = 1;

        private string file = @"C:\WINDOWS\Temp\test.csv";

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

            Assert.IsTrue(operations.Init());

            var credentials = operations.ftp.Credentials.GetCredential(null, "");
            Assert.AreEqual(credentials.Password, password);
            Assert.AreEqual(credentials.UserName, username);

            Assert.IsTrue(operations.ftp is WebClient);
        }

        [TestMethod]
        public void Upload_IncorrectCode_ts()
        {
            Mock<IWebClient> mock = new Mock<IWebClient>();
            mock.Setup(m => m.UploadFile("ftp://localhost:21/import_TestKey_splitfile_config/test.csv", "STOR", file));

            Operations operations = new Operations(username, password);
            operations.Init();

            operations.ftp = mock.Object;

            operations.Upload(file);

            mock.Verify(m => m.UploadFile("ftp://localhost:21/import_TestKey_splitfile_config/test.csv", "STOR", file), Times.Once());
            //mock.VerifyAll();

            //IWebClient mock = Mock.Of<IWebClient>(l =>
            //    l.UploadFile("ftp://bacon:21/import_TestKey_splitfile_config/test.csv", "STOR", file) == new byte[] {});

            //mock.Object;

            //Operations operations = new Operations(username, password);
            //operations.init(new WrappedWebClient());

            //operations.upload(file);
        }
    }
}

