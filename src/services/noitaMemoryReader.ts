export type SeedState = "detected" | "menu" | "not-running" | "error";

export interface SeedResponse {
  seed: number | null;
  error: string | null;
  state: SeedState;
}

interface RawSeedResponse {
  seed: number | null;
  error: string | null;
}

export class NoitaMemoryReaderService {
  private intervalId: NodeJS.Timeout | null = null;
  private isCurrentlyPolling = false;

  async getCurrentSeed(): Promise<SeedResponse> {
    try {
      const response = await fetch("/api/noita/current-seed");
      const data: RawSeedResponse = await response.json();

      return this.parseResponse(data);
    } catch (err) {
      console.error("Error fetching Noita seed:", err);
      return {
        seed: null,
        error: "Failed to connect to server",
        state: "error",
      };
    }
  }

  startPolling(intervalMs: number, callback: (response: SeedResponse) => void): void {
    if (this.isCurrentlyPolling) {
      console.warn("Polling already active");
      return;
    }

    this.isCurrentlyPolling = true;

    // Initial fetch
    this.getCurrentSeed()
      .then(callback)
      .catch(err => console.error("Error in initial seed fetch:", err));

    // Set up interval
    this.intervalId = setInterval(() => {
      this.getCurrentSeed()
        .then(callback)
        .catch(err => console.error("Error in polling seed fetch:", err));
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCurrentlyPolling = false;
  }

  isPolling(): boolean {
    return this.isCurrentlyPolling;
  }

  private parseResponse(data: RawSeedResponse): SeedResponse {
    // Determine state based on response
    let state: SeedState;

    if (data.error) {
      if (data.error === "Noita is not running") {
        state = "not-running";
      } else if (data.error === "Seed is 0 - are you still in the main menu?") {
        state = "menu";
      } else {
        state = "error";
      }
    } else if (data.seed !== null && data.seed > 0) {
      state = "detected";
    } else if (data.seed === 0) {
      state = "menu";
    } else {
      state = "error";
    }

    return {
      seed: data.seed,
      error: data.error,
      state,
    };
  }
}
