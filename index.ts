const { exec } = require("child_process");
exec(
  "npm run dev",
  { shell: "powershell.exe" },
  (error: Error, stdout: any, stderr: any) => {
    // do whatever with stdout
    console.log(stdout);
  }
);
