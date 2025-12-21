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
  private isOnline: boolean = false;
  private connectionChecked: boolean = false;

  constructor() {
    this.loadConfig();
    apiService.updateConfig(this.config.apiBaseUrl, this.config.userIdentity);
    this.checkConnection().then(() => {
      this.connectionChecked = true;
      console.log("Connection check completed. isOnline:", this.isOnline);
    });
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
        console.log(
          "🔍 Testing connection to backend...",
          this.config.apiBaseUrl,
        );
        this.isOnline = await apiService.testConnection();
        console.log("✅ Backend connection status:", this.isOnline);
        console.log(
          "📡 Active service will be:",
          this.isOnline ? "API Service" : "Mock Service",
        );
        if (!this.isOnline) {
          console.warn("⚠️ Backend not available, falling back to mock data");
        }
      } catch (error) {
        console.warn("❌ Connection check failed:", error);
        this.isOnline = false;
      }
    } else {
      console.log("🔧 Using mock data (configured)");
      this.isOnline = false; // Explicitly set to false when using mock
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
      done: apiList.done || false,
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
    // Ensure connection is checked before creating
    if (!this.connectionChecked && !this.config.useMockData) {
      console.log("Waiting for connection check to complete...");
      await this.checkConnection();
      this.connectionChecked = true;
    }

    try {
      const serviceName = this.isUsingMockData()
        ? "Mock Service"
        : "API Service";
      console.log(`Creating shopping list using: ${serviceName}`);
      console.log("Connection status:", this.getConnectionStatus());
      console.log("Config:", {
        useMockData: this.config.useMockData,
        isOnline: this.isOnline,
      });

      const apiData = this.convertToApiFormat(list);
      const result = await this.activeService.createShoppingList(
        apiData.name,
        apiData.category,
      );
      console.log("Shopping list created successfully:", result);
      return this.convertToFrontendFormat(result);
    } catch (error) {
      console.error("Failed to create shopping list:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
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
    // Ensure connection is checked before fetching
    if (!this.connectionChecked && !this.config.useMockData) {
      console.log("Waiting for connection check to complete...");
      await this.checkConnection();
      this.connectionChecked = true;
    }

    try {
      console.log(
        "Getting shopping lists from:",
        this.isUsingMockData() ? "Mock Service" : "API Service",
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
    updates: Partial<ShoppingList>,
  ): Promise<ShoppingList> {
    try {
      if (!updates.name) {
        throw new Error("Name is required for update");
      }
      const result = await this.activeService.updateShoppingList(
        id,
        updates.name,
        updates.done,
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

  async toggleDone(id: string, currentDone: boolean): Promise<ShoppingList> {
    try {
      // Get the shopping list to get its name
      const list = await this.activeService.getShoppingList(id);
      // Update with the new done status
      const result = await this.activeService.updateShoppingList(
        id,
        list.name,
        !currentDone,
      );
      return this.convertToFrontendFormat(result);
    } catch (error) {
      console.error("Failed to toggle done status:", error);
      throw new Error("Nepodařilo se změnit stav seznamu");
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
