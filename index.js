// Our imports

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();

//Array of showlad files

const generate_showlads = () => {
  const dllPath = path.join(
    __dirname,
    "discord_exporter",
    "DiscordChatExporter.Cli.dll"
  );

  const command = `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 1099045055093821520 -f PlainText -o "${process.env.FILE_DIR}/coolstorium.txt" --media --media-dir "${process.env.FILE_DIR}"`;

  const childProcess = spawn(command, [], { shell: true, stdio: "inherit" });

  childProcess.on("exit", (code) => {
    if (code === 0) {
      console.log("Lads rounded up...");
      console.log("Filtering out non-text files...");
      filter_junk();
    } else {
      console.error(`Error: Command exited with code ${code}`);
    }
  });
};

const filter_junk = () => {
  const directoryPath = process.env.FILE_DIR;

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Filter out .txt files
    const txtFiles = files.filter((file) => path.extname(file) === ".txt");

    // Now txtFiles array contains the names of all .txt files in the directory
    console.log("Found .txt files:", txtFiles);

    // Remove files not in txtFiles array
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Check if the file is not in txtFiles array
      if (path.extname(file) !== ".txt" && !txtFiles.includes(file)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
            return;
          }
        });
      }
    });

    //Now onto data sorting...
    console.log("Files filtered, sorting data to csv...");
    sort_data(txtFiles);
  });
};

const sort_data = (txtFiles) => {
  if (txtFiles.length === 0) {
    return console.log("No text files found, exiting...");
  }

  const formattedLads = []; //store our formatted boys for eventual CSVing

  console.log("Please be patient, sorting may take a minute or so...");

  txtFiles.forEach((file) => {
    const filePath = path.join(__dirname, "showlads_dump", file);

    const data = fs.readFileSync(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Failed to read file: ", err);
        return;
      }
    });
    //Date parsing is a bit fucky, for coolstorium text posts we go line by line and update the date as we find it. For text files, we can pull the metadata.
    const curDate = null;

    console.log(createdDate(filePath));
    const lines = data.split("\n");
    // console.log(lines);
    // return;
    const bulletPointLines = lines.filter((line) => /^\s*•/.test(line));

    //regex for taking our bullet point lines and reformatting into csv
    const regexWithRole = /^\s*•\s*(.*?)\((.*?)\)\s*:\s*(.*)/;
    const regexWithoutRole = /^\s*•\s*(.*?)\s*:\s*(.*)/;
    const regexWaitress = /^\s*•\s*(.*?)\((.*?)\)\s*:\s*(.*)/; //Because randy put a /n in them for some fucking reason

    bulletPointLines.forEach((line) => {
      const matchWithRole = line.match(regexWithRole);
      const matchWaitress = line.match(regexWaitress);
      const matchWithoutRole = line.match(regexWithoutRole);

      if (matchWithRole || matchWaitress) {
        const [, char_name, role, ckey] = matchWithRole;
        formattedLads.push(`${char_name},${role},${ckey.toLowerCase()}`);
      } else if (matchWithoutRole) {
        const [, char_name, ckey] = matchWithoutRole;
        formattedLads.push(`${char_name},Unknown,${ckey.toLowerCase()}`);
      } else {
        return;
      }
    });
  });
  createCSVFile(formattedLads);
};

const createCSVFile = (formattedData) => {
  const csvFilePath = path.join(
    __dirname,
    "showlads_dump",
    "formatted_lads.csv"
  );

  const csvData = formattedData.join("\n");

  // Check if the file exists, if not, create it
  fs.access(csvFilePath, fs.constants.F_OK, async (err) => {
    if (err) {
      // File doesn't exist, create it and write the header
      fs.writeFileSync(csvFilePath, "ckey,role,char_name\n", "utf8");
    }

    await fs.writeFile(csvFilePath, csvData, "utf8", (err) => {
      if (err) {
        console.error("Error writing to CSV file:", err);
      } else {
        console.log(
          "Lads properly sorted, thank you for your patience, cleaning up..."
        );
      }
    });
    clean_up();
  });
};

const createdDate = (file) => {
  const { birthtime } = fs.statSync(file);

  return birthtime;
};

const clean_up = () => {
  // Delete every other file in the folder

  const dirPath = path.join(__dirname, "showlads_dump");

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
    } else {
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (file !== ".gitignore.txt" && file !== "formatted_lads.csv") {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            }
          });
        }
      });
    }
  });
  console.log("All done, enjoy!");
};

generate_showlads();
