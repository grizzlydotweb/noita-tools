export interface LaunchStatus {
  status: "connecting" | "launching" | "running" | "error" | "idle";
  message?: string;
}

export interface LaunchError {
  message: string;
  code?: string;
}

export interface ProcessInfo {
  pid?: number;
  name: string;
  cmd?: string;
}

export interface RestartResult {
  success: boolean;
  message: string;
  process?: ProcessInfo;
  error?: LaunchError;
}

export class NoitaLauncherService {
  private apiEndpoint = "/api/noita/restart";

  async restart(cleanSave = true, gameMode = "normal"): Promise<RestartResult> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "new_game",
          cleanSave,
          gameMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as RestartResult;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  }
}
