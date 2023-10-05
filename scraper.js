// Our imports
const path = require("path");
const { spawnSync } = require("child_process");
require("dotenv").config();

// Array of showlad files
const generate_showlads = () => {
  const dllPath = path.join(
    __dirname,
    "discord_exporter",
    "DiscordChatExporter.Cli.dll"
  );

  // Order goes showlads, coolstorium, questions, general
  const scrapeCommands = [
    `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 1099045055093821520 -f PlainText -o "${process.env.FILE_DIR}/showlads.txt" --media --media-dir "${process.env.FILE_DIR}"`,
    `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 157978667232788481 -f PlainText -o "${process.env.FILE_DIR}/coolstorium.txt"`,
    `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 211312597612494848 -f PlainText -o "${process.env.FILE_DIR}/questions.txt"`,
    `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 253020121688309761 -f PlainText -o "${process.env.FILE_DIR}/general.txt"`,
  ];

  scrapeCommands.forEach((command, index) => {
    const result = spawnSync(command, [], { shell: true, stdio: "inherit" });

    if (result.status === 0) {
      console.log(`${index + 1}/${scrapeCommands.length} Lads Rounded Up...`);
    } else {
      console.error(`Error: Command exited with code ${result.status}`);
    }
  });
};

generate_showlads();
