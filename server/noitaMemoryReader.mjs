import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

const NOITA_SEED_OFFSET = 0xe05004;

/**
 * Reads the current seed from Noita's memory (Linux only)
 * @returns {Promise<{seed: number | null, error: string | null}>}
 */
async function readNoitaSeedLinux() {
  try {
    // Find the Noita process
    let pidOutput = "";
    try {
      const result = await execAsync("pgrep -x noita.exe");
      pidOutput = result.stdout;
    } catch (err) {
      // pgrep returns non-zero exit code when no process found
      if (err.code !== 0) {
        return {
          seed: null,
          error: "Noita is not running",
        };
      }
      throw err;
    }

    if (!pidOutput.trim()) {
      return {
        seed: null,
        error: "Noita is not running",
      };
    }

    const pid = parseInt(pidOutput.trim(), 10);

    if (isNaN(pid)) {
      return {
        seed: null,
        error: "Invalid process ID",
      };
    }

    // Read the memory maps to find the base address of noita.exe
    const mapsPath = `/proc/${pid}/maps`;
    let mapsContent;

    try {
      mapsContent = await fs.readFile(mapsPath, "utf-8");
    } catch (err) {
      if (err.code === "ENOENT") {
        return {
          seed: null,
          error: "Noita process not found",
        };
      }
      if (err.code === "EACCES") {
        return {
          seed: null,
          error: "Permission denied. Run the server with the same user as Noita or with sudo",
        };
      }
      throw err;
    }

    // Find the base address of noita.exe (first executable mapping)
    const lines = mapsContent.split("\n");
    let baseAddr = null;

    for (const line of lines) {
      if (line.includes("noita.exe") && line.includes("r-xp")) {
        const addrRange = line.split(" ")[0];
        const startAddr = addrRange.split("-")[0];
        baseAddr = parseInt(startAddr, 16);
        break;
      }
    }

    if (baseAddr === null) {
      return {
        seed: null,
        error: "Could not find noita.exe base address in memory maps",
      };
    }

    // Calculate the target address
    const targetAddr = baseAddr + NOITA_SEED_OFFSET;

    // Read the seed from memory
    const memPath = `/proc/${pid}/mem`;
    let fileHandle;

    try {
      fileHandle = await fs.open(memPath, "r");

      // Read 4 bytes (unsigned 32-bit integer) at the target address
      const buffer = Buffer.alloc(4);
      await fileHandle.read(buffer, 0, 4, targetAddr);

      // Parse as little-endian unsigned 32-bit integer
      const seed = buffer.readUInt32LE(0);

      await fileHandle.close();

      if (seed === 0) {
        return {
          seed: 0,
          error: "Seed is 0 - are you still in the main menu?",
        };
      }

      return {
        seed,
        error: null,
      };
    } catch (err) {
      if (fileHandle) {
        await fileHandle.close();
      }

      if (err.code === "EACCES") {
        return {
          seed: null,
          error: "Permission denied reading /proc/PID/mem. Run the server with the same user as Noita or with sudo",
        };
      }

      throw err;
    }
  } catch (err) {
    console.error("Error reading Noita seed from memory:", err);
    return {
      seed: null,
      error: `Unexpected error: ${err.message}`,
    };
  }
}

/**
 * Stub implementation for Windows (not implemented yet)
 * @returns {Promise<{seed: number | null, error: string | null}>}
 */
async function readNoitaSeedWindows() {
  return {
    seed: null,
    error: "Windows memory reading not implemented yet. Please enter seed manually.",
  };
}

/**
 * Stub implementation for macOS (not implemented yet)
 * @returns {Promise<{seed: number | null, error: string | null}>}
 */
async function readNoitaSeedMacOS() {
  return {
    seed: null,
    error: "macOS memory reading not implemented yet. Please enter seed manually.",
  };
}

/**
 * Reads the current seed from Noita's memory
 * @returns {Promise<{seed: number | null, error: string | null}>}
 */
export async function readNoitaSeed() {
  const platform = os.platform();

  switch (platform) {
    case "linux":
      return await readNoitaSeedLinux();
    case "win32":
      return await readNoitaSeedWindows();
    case "darwin":
      return await readNoitaSeedMacOS();
    default:
      return {
        seed: null,
        error: `Unsupported platform: ${platform}. Please enter seed manually.`,
      };
  }
}
