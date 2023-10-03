// Our imports

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();

const generate_showlads = () => {
  const dllPath = path.join(
    __dirname,
    "discord_exporter",
    "DiscordChatExporter.Cli.dll"
  );

  const command = `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 1099045055093821520 -f PlainText -o "${process.env.FILE_DIR}"`;

  const childProcess = spawn(command, [], { shell: true, stdio: "inherit" });

  childProcess.on("exit", (code) => {
    if (code === 0) {
      console.log("Command executed successfully.");
    } else {
      console.error(`Error: Command exited with code ${code}`);
    }
  });
};

// const get_all_showlads = () => {
//   const directoryPath = process.env.FILE_DIR;

//   fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//       console.error("Error reading directory:", err);
//       return;
//     }

//     // Filter out .txt files
//     const txtFiles = files.filter((file) => path.extname(file) === ".txt");

//     // Now txtFiles array contains the names of all .txt files in the directory
//     console.log("Found .txt files:", txtFiles);
//   });
// };

// // Step 1: Read the text file
// fs.readFile("your_file.txt", "utf8", (err, data) => {
//   if (err) {
//     console.error("Error reading the file:", err);
//     return;
//   }

//   // Step 2: Split the file content into lines
//   const lines = data.split("\n");

//   // Step 3: Create an object to store unique entries and check for duplicates
//   const uniqueEntries = {};

//   // Step 4: Iterate through lines and identify duplicates
//   lines.forEach((line) => {
//     line = line.trim(); // Remove extra spaces and newline characters
//     if (line) {
//       if (uniqueEntries[line]) {
//         // Duplicate found
//         console.log("Duplicate entry:", line);
//       } else {
//         // Add the entry to the object for future comparison
//         uniqueEntries[line] = true;
//       }
//     }
//   });
// });

generate_showlads();
