// Our imports
const path = require("path");
const { spawnSync } = require("child_process");
require("dotenv").config();
const { getTodayAndFridayDate } = require("./helper_functions.js");

// Array of showlad files
const generate_showlads = () => {
  const dllPath = path.join(
    __dirname,
    "discord_exporter",
    "DiscordChatExporter.Cli.dll"
  );

  // Order goes showlads, coolstorium, questions, general

  const date_range = getTodayAndFridayDate();

  const command = `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 1099045055093821520 -f PlainText -o "${process.env.FILE_DIR}/showlads.txt" --media --media-dir "${process.env.FILE_DIR}" --after "${date_range.previousFriday}" --before "${date_range.today}"`;

  const result = spawnSync(command, [], { shell: true, stdio: "inherit" });

  if (result.status === 0) {
    console.log(`Lads Rounded Up...`);
  } else {
    console.error(`Error: Command exited with code ${result.status}`);
  }
};

generate_showlads();
