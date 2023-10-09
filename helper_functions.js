const fs = require("fs");
const path = require("path");

const createdDate = (file) => {
  const { birthtime } = fs.statSync(file);

  return formatToMySQLDatetime(birthtime);
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

function formatToMySQLDatetime(inputString) {
  const inputDate = new Date(inputString); // Parse the input string
  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(inputDate.getDate()).padStart(2, "0");
  const hours = String(inputDate.getHours()).padStart(2, "0");
  const minutes = String(inputDate.getMinutes()).padStart(2, "0");
  const seconds = String(inputDate.getSeconds()).padStart(2, "0");

  const mysqlDatetimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return mysqlDatetimeString;
}

function formatDatetime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const getTodayAndFridayDate = () => {
  const today = new Date();
  const friday = new Date(today);

  // Set the date to the previous Friday and set the time to 13:00
  friday.setDate(friday.getDate() - 3);
  friday.setHours(9, 0, 0, 0);

  // Format the dates as 'YYYY-MM-DD HH:mm'
  const formattedToday = today.toISOString().slice(0, 16).replace("T", " ");
  const formattedFriday = friday.toISOString().slice(0, 16).replace("T", " ");

  return { today: formattedToday, previousFriday: formattedFriday };
};

module.exports = {
  createdDate,
  getDates,
  clean_up,
  createCSVFile,
  formatToMySQLDatetime,
  getTodayAndFridayDate,
};
