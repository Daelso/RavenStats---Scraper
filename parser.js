const fs = require("fs");
const path = require("path");
const {
  createdDate,
  createCSVFile,
  formatToMySQLDatetime,
} = require("./helper_functions.js");
require("dotenv").config();

//Imports above

//These are the parse functions, include some imports

const filter_junk = () => {
  const directoryPath = process.env.FILE_DIR;

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Filter out .txt files
    const txtFiles = files.filter((file) => path.extname(file) === ".txt");

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
    let curDate = null;
    const textFiles = [
      "showlads.txt",
      "coolstorium.txt",
      "questions.txt",
      "general.txt",
    ];
    const excludedFile = textFiles.includes(file);

    if (!excludedFile) {
      curDate = createdDate(filePath);
    }
    const lines = data.split("\n");

    const bulletPointLines = lines.filter((line) => /^(•|\[)/.test(line));

    //regex for taking our bullet point lines and reformatting into csv
    const regexWithRole = /^\s*•\s*(.*?)\((.*?)\)\s*:\s*(.*)/;
    const regexWithoutRole = /^\s*•\s*(.*?)\s*:\s*(.*)/;
    const regexWaitress = /^\s*•\s*(.*?)\((.*?)\)\s*:\s*(.*)/; //Because randy put a /n in them for some fucking reason
    const datePattern = /\[(\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (?:AM|PM))\]/;

    bulletPointLines.forEach((line) => {
      const matchWithRole = line.match(regexWithRole);
      const matchWaitress = line.match(regexWaitress);
      const matchWithoutRole = line.match(regexWithoutRole);

      if (excludedFile) {
        const dateMatch = line.match(datePattern);

        if (dateMatch) {
          const extractedDateTime = dateMatch ? dateMatch[1] : null;

          curDate = formatToMySQLDatetime(extractedDateTime);
        }
      }

      if (matchWithRole || matchWaitress) {
        const [, char_name, role, ckey] = matchWithRole;
        formattedLads.push(
          `${char_name},${role},${ckey.toLowerCase().trim()},${curDate}`
        );
      } else if (matchWithoutRole) {
        const [, char_name, ckey] = matchWithoutRole;
        formattedLads.push(
          `${char_name},Unknown,${ckey.toLowerCase().trim()},${curDate}`
        );
      } else {
        return;
      }
    });
  });
  createCSVFile(formattedLads);
};

filter_junk();

module.exports = {
  filter_junk,
  sort_data,
};
