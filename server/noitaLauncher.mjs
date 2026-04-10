import { exec, spawn } from "child_process";
import { promisify } from "util";
import { platform } from "os";
import path from "path";

const execAsync = promisify(exec);

class ProcessManager {
  constructor() {
    this._steamPath = process.env.STEAM_PATH || this._getDefaultSteamPath();
    this._noitaAppId = process.env.NOITA_APP_ID || "881100";
  }

  _getDefaultSteamPath() {
    if (platform() === "win32") {
      return "C:\\Program Files (x86)\\Steam\\steam.exe";
    } else if (platform() === "linux") {
      return path.join(process.env.HOME || "", ".steam", "steam", "steam.sh");
    }
    return "steam";
  }

  async _executeCommand(command) {
    try {
      return await execAsync(command);
    } catch (error) {
      if (error.code === 1 && error.stdout) {
        return { stdout: error.stdout, stderr: error.stderr || "" };
      }
      throw error;
    }
  }

  async isNoitaRunning() {
    const currentPlatform = platform();

    try {
      if (currentPlatform === "win32") {
        const { stdout } = await this._executeCommand('tasklist /FI "IMAGENAME eq noita.exe"');
        return stdout.toLowerCase().includes("noita.exe");
      } else {
        const { stdout } = await this._executeCommand("pgrep -f noita.exe || pgrep -f noita.x86_64 || true");
        return stdout.trim().length > 0;
      }
    } catch (error) {
      console.error("Error checking Noita process:", error);
      return false;
    }
  }

  async killNoita() {
    const currentPlatform = platform();

    try {
      const isRunning = await this.isNoitaRunning();
      if (!isRunning) {
        return { success: true, message: "Noita is not running" };
      }

      if (currentPlatform === "win32") {
        await this._executeCommand("taskkill /F /IM noita.exe");
        return { success: true, message: "Noita process killed" };
      } else {
        await this._executeCommand("pkill -f noita.exe || pkill -f noita.x86_64 || true");
        return { success: true, message: "Noita process killed" };
      }
    } catch (error) {
      const message = `Failed to kill Noita: ${error.message}`;
      console.error(message);
      return { success: false, message };
    }
  }

  async launchNoita(options = { cleanSave: true, gameMode: "normal" }) {
    try {
      const args = ["-applaunch", this._noitaAppId];

      if (options.cleanSave) {
        args.push("-clean_save");
      }

      if (options.gameMode) {
        args.push("-gamemode", options.gameMode);
      }

      const steamProcess = spawn(this._steamPath, args, {
        detached: true,
        stdio: "ignore",
      });

      steamProcess.unref();

      return {
        success: true,
        message: "Steam launch command executed",
        process: {
          pid: steamProcess.pid,
          name: "steam",
          cmd: `${this._steamPath} ${args.join(" ")}`,
        },
      };
    } catch (error) {
      const message = `Failed to launch Noita: ${error.message}`;
      console.error(message);
      return {
        success: false,
        message,
        error: { message, code: error.code },
      };
    }
  }

  async restartNoita(options = { cleanSave: true, gameMode: "normal" }) {
    console.log("Restarting Noita...");

    try {
      const killResult = await this.killNoita();

      await new Promise(resolve => setTimeout(resolve, 2000));

      const launchResult = await this.launchNoita(options);

      if (!launchResult.success) {
        throw new Error(launchResult.message);
      }

      return {
        success: true,
        message: killResult.message + " → " + launchResult.message,
        process: launchResult.process,
        killed: killResult.success,
      };
    } catch (error) {
      const message = `Failed to restart Noita: ${error.message}`;
      console.error(message);
      return {
        success: false,
        message,
        error: { message, code: error.code },
      };
    }
  }
}

export default ProcessManager;
