// Our imports

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

  const command = `dotnet "${dllPath}" export -t "${process.env.DISCORD_TOKEN}" -c 1099045055093821520 -f PlainText -o "${process.env.FILE_DIR}/showlads.txt" --media --media-dir "${process.env.FILE_DIR}"`;

  const childProcess = spawn(command, [], { shell: true, stdio: "inherit" });

  childProcess.on("exit", (code) => {
    if (code === 0) {
      console.log("Lads rounded up...");
    } else {
      console.error(`Error: Command exited with code ${code}`);
    }
  });
};

generate_showlads();
