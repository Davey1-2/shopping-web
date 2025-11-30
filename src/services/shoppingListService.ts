import { apiService, ApiShoppingList } from "./api";
import { mockService } from "./mockService";
import { ShoppingList } from "@/types";

export interface AppConfig {
  useMockData: boolean;
  apiBaseUrl: string;
  userIdentity: string;
}

export interface ConnectionStatus {
  isOnline: boolean;
  usingMock: boolean;
  service: string;
}

const DEFAULT_CONFIG: AppConfig = {
  useMockData: false,
  apiBaseUrl: "http://localhost:3001",
  userIdentity: "frontend-user",
};

class ShoppingListService {
  private config: AppConfig = DEFAULT_CONFIG;
  private isOnline: boolean = true;

  constructor() {
    this.loadConfig();
    apiService.updateConfig(this.config.apiBaseUrl, this.config.userIdentity);
    this.checkConnection();
  }

  private loadConfig(): void {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("app-config");
      if (savedConfig) {
        try {
          this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
        } catch (error) {
          console.warn("Failed to load config, using defaults:", error);
        }
      }
    }
  }

  private saveConfig(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-config", JSON.stringify(this.config));
    }
  }

  private async checkConnection(): Promise<void> {
    if (!this.config.useMockData) {
      try {
        console.log("Testing connection to backend...");
        this.isOnline = await apiService.testConnection();
        console.log("Backend connection status:", this.isOnline);
        if (!this.isOnline) {
          console.warn("Backend not available, falling back to mock data");
        }
      } catch (error) {
        console.warn("Connection check failed:", error);
        this.isOnline = false;
      }
    } else {
      console.log("Using mock data (configured)");
    }
  }

  private get activeService() {
    return this.config.useMockData || !this.isOnline ? mockService : apiService;
  }

  setConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    if (newConfig.apiBaseUrl || newConfig.userIdentity) {
      apiService.updateConfig(this.config.apiBaseUrl, this.config.userIdentity);
    }

    if (!newConfig.useMockData) {
      this.checkConnection();
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  isUsingMockData(): boolean {
    return this.config.useMockData || !this.isOnline;
  }

  private convertToFrontendFormat(apiList: ApiShoppingList): ShoppingList {
    if (!apiList) {
      console.error("convertToFrontendFormat received null/undefined apiList");
      throw new Error("Invalid API list data");
    }

    console.log("Converting API list to frontend format:", apiList);

    return {
      id: apiList.id || "",
      name: apiList.name || "Unnamed List",
      category: apiList.category || "Obecné",
      ingredients: apiList.items
        ? apiList.items.map((item) => item?.name || "Unknown Item")
        : [],
      createdOnHome: this.isUsingMockData(),
    };
  }

  private convertToApiFormat(frontendList: Partial<ShoppingList>): {
    name: string;
    category?: string;
  } {
    return {
      name: frontendList.name || "",
      category: frontendList.category,
    };
  }

  async createShoppingList(list: Partial<ShoppingList>): Promise<ShoppingList> {
    try {
      const apiData = this.convertToApiFormat(list);
      const result = await this.activeService.createShoppingList(
        apiData.name,
        apiData.category
      );
      return this.convertToFrontendFormat(result);
    } catch (error) {
      console.error("Failed to create shopping list:", error);
      throw new Error("Nepodařilo se vytvořit nákupní seznam");
    }
  }

  async getShoppingList(id: string): Promise<ShoppingList> {
    try {
      const result = await this.activeService.getShoppingList(id);
      return this.convertToFrontendFormat(result);
    } catch (error) {
      console.error("Failed to get shopping list:", error);
      throw new Error("Nepodařilo se načíst nákupní seznam");
    }
  }

  async getAllShoppingLists(): Promise<ShoppingList[]> {
    try {
      console.log(
        "Getting shopping lists from:",
        this.isUsingMockData() ? "Mock Service" : "API Service"
      );
      const result = await this.activeService.getMyShoppingLists(0, 100);
      console.log("Raw result from service:", result);

      if (!result || !result.itemList) {
        console.warn("Invalid result structure:", result);
        return [];
      }

      return result.itemList.map((list) => {
        console.log("Converting list:", list);
        return this.convertToFrontendFormat(list);
      });
    } catch (error) {
      console.error("Failed to get shopping lists:", error);
      throw new Error("Nepodařilo se načíst nákupní seznamy");
    }
  }

  async updateShoppingList(
    id: string,
    updates: Partial<ShoppingList>
  ): Promise<ShoppingList> {
    try {
      if (!updates.name) {
        throw new Error("Name is required for update");
      }
      const result = await this.activeService.updateShoppingList(
        id,
        updates.name
      );
      return this.convertToFrontendFormat(result);
    } catch (error) {
      console.error("Failed to update shopping list:", error);
      throw new Error("Nepodařilo se aktualizovat nákupní seznam");
    }
  }

  async deleteShoppingList(id: string): Promise<void> {
    try {
      await this.activeService.deleteShoppingList(id);
    } catch (error) {
      console.error("Failed to delete shopping list:", error);
      throw new Error("Nepodařilo se smazat nákupní seznam");
    }
  }

  async refreshConnection(): Promise<boolean> {
    await this.checkConnection();
    return this.isOnline;
  }

  getConnectionStatus(): {
    isOnline: boolean;
    usingMock: boolean;
    service: string;
  } {
    return {
      isOnline: this.isOnline,
      usingMock: this.isUsingMockData(),
      service: this.isUsingMockData() ? "Mock Service" : "API Service",
    };
  }
}

export const shoppingListService = new ShoppingListService();
export type { ApiShoppingList };
