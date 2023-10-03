const fs = require("fs");
const path = require("path");

const createdDate = (file) => {
  const { birthtime } = fs.statSync(file);

  return birthtime.toISOString();
};

const getDates = (datetimeString) => {
  const [datePart, timePart] = datetimeString.split(" ");
  const [month, day, year] = datePart.split("/");
  let [hours, minutes] = timePart.split(":");
  const ampm = datetimeString.includes("AM") ? "AM" : "PM";

  if (ampm === "PM") {
    hours = (parseInt(hours, 10) % 12) + 12;
  } else {
    hours = parseInt(hours, 10) % 12;
  }

  return new Date(year, month - 1, day, hours, minutes, 0).toISOString();
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

module.exports = {
  createdDate,
  getDates,
  clean_up,
  createCSVFile,
};
