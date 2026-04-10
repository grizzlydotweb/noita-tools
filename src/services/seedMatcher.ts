import { db, SearchesItem } from "./db";
import { SeedSearcher } from "./seedSearcher";
import { ILogicRules } from "./SeedInfo/infoHandler/IRule";
import GameInfoProvider from "./SeedInfo/infoHandler";

export interface SeedMatchResult {
  matches: boolean;
  error?: string;
}

export class SeedMatcherService {
  private seedSearcher: SeedSearcher;
  private unlockedSpells?: boolean[];

  constructor(unlockedSpells?: boolean[]) {
    this.unlockedSpells = unlockedSpells;
    // Create a SeedSearcher instance with a GameInfoProvider
    const gameInfoProvider = new GameInfoProvider({ seed: 0 }, [], undefined, undefined, false);
    this.seedSearcher = new SeedSearcher(gameInfoProvider);
  }

  async getSearchByUUID(uuid: string): Promise<SearchesItem | null> {
    try {
      const search = await db.searches.get({ uuid });
      return search || null;
    } catch (error) {
      console.error("Error fetching search from database:", error);
      return null;
    }
  }

  async checkSeedAgainstSearch(seed: number, searchUUID: string): Promise<SeedMatchResult> {
    try {
      // Load search from database
      const search = await this.getSearchByUUID(searchUUID);

      if (!search) {
        return {
          matches: false,
          error: "Search not found",
        };
      }

      // Decode rules from base64
      let rules: ILogicRules;
      try {
        rules = JSON.parse(atob(search.config.rules));
      } catch (error) {
        return {
          matches: false,
          error: "Invalid search rules format",
        };
      }

      // Check if seed matches rules
      const matches = await this.seedSearcher.checkSingleSeed(seed, rules, this.unlockedSpells);

      return {
        matches,
      };
    } catch (error) {
      console.error("Error checking seed against search:", error);
      return {
        matches: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  setUnlockedSpells(unlockedSpells: boolean[]): void {
    this.unlockedSpells = unlockedSpells;
  }
}
