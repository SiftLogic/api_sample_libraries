// Demonstrates how the operations object can be used. It is better to require the operation.js file
// your code directly for increased flexibility.
// 1. Uploads the specified file in multifile mode (unless otherwise specified).
// 2. Polls the server until the results are complete.
// 3. Downloads the results to the specified location.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommandLine;
using CommandLine.Text;

namespace CSharpFTPExample
{
    class Options
    {
        // Required
        [Option('f', Required = true,
          HelpText = "The absolute file path of the upload file")]
        public string InputFile { get; set; }

        [Option('l', Required = true,
          HelpText = "The absolute location of where the results file should be placed")]
        public string InputLocation { get; set; }

        [Option('k', Required = true,
          HelpText = "The key name defined in the manage api keys section")]
        public string InputKey { get; set; }

        [Option('p', Required = true,
          HelpText = "The password defined in the manage api keys section")]
        public string InputPassword { get; set; }

        // Optional
        [Option("poll", DefaultValue = "300",
          HelpText = "The number of seconds to poll for")]
        public string InputPoll { get; set; }

        [Option("host", DefaultValue = "localhost",
          HelpText = "The host to connect to")]
        public string InputHost { get; set; }

        [Option("port", DefaultValue = "21",
          HelpText = "The port to connect to")]
        public string InputPort { get; set; }

        [Option("singleFile", DefaultValue = false,
          HelpText = "Whether to run in single file mode")]
        public bool InputSingleFile { get; set; }

        [HelpOption]
        public string GetUsage()
        {
            var usage = new StringBuilder();
            usage.AppendLine("Usage: -f [file name] -l [download location] -k [key] -p [password]\n");
            usage.AppendLine("Example: -f ../test.csv -l /tmp -k TestKey -p e261742d-fe2f-4569-95e6-312689d049 --poll 10");
            usage.AppendLine("Upload test.csv, process it and download the results to /tmp, poll every 10s\n");

            // Remove the copyright and version lines as they are unnecessary
            var help = HelpText.AutoBuild(this, (HelpText current) => HelpText.DefaultParsingErrorsHandler(this, current));
            string[] helpArray = (help + "").Split('\n');
            usage.AppendLine(String.Join("\n", helpArray, 2, helpArray.Length - 3));

            return usage + "";
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var options = new Options();
            if (CommandLine.Parser.Default.ParseArguments(args, options))
            {
                // Required
                Console.WriteLine("File: {0}", options.InputFile);
                Console.WriteLine("Location: {0}", options.InputLocation);
                Console.WriteLine("Key: {0}", options.InputKey);
                Console.WriteLine("Password: {0}", options.InputPassword);

                // Optional
                Console.WriteLine("Poll: {0}", options.InputPoll);
                Console.WriteLine("Host: {0}", options.InputHost);
                Console.WriteLine("Port: {0}", options.InputPort);
                Console.WriteLine("singleFile: {0}", options.InputSingleFile);
            }

            Console.WriteLine("Press Enter to close this program...");
            Console.ReadLine();
        }
    }
}
