interface ApiShoppingList {
  awid: string;
  id: string;
  name: string;
  category?: string;
  state: "active" | "archived" | "deleted";
  ownerUuIdentity: string;
  items: Array<{
    id: string;
    name: string;
    completed: boolean;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  itemList: T[];
  pageInfo: {
    pageIndex: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseUrl: string;
  private userIdentity: string;

  constructor(
    baseUrl: string = "http://localhost:3001",
    userIdentity: string = "frontend-user",
  ) {
    this.baseUrl = baseUrl;
    this.userIdentity = userIdentity;
    console.log(
      `ApiService initialized with baseUrl: ${baseUrl}, userIdentity: ${userIdentity}`,
    );
  }

  updateConfig(baseUrl: string, userIdentity: string) {
    this.baseUrl = baseUrl;
    this.userIdentity = userIdentity;
    console.log(
      `ApiService config updated - baseUrl: ${baseUrl}, userIdentity: ${userIdentity}`,
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "x-user-identity": this.userIdentity,
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making API request to: ${url}`, config);

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        if (data.uuAppErrorMap) {
          const firstError = Object.values(data.uuAppErrorMap)[0] as {
            type: string;
            message: string;
            paramMap?: Record<string, string>;
          };
          throw new Error(firstError.message || "API Error");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async createShoppingList(
    name: string,
    category?: string,
  ): Promise<ApiShoppingList> {
    return this.request<ApiShoppingList>("/shoppingList/create", {
      method: "POST",
      body: JSON.stringify({ name, category }),
    });
  }

  async getShoppingList(id: string): Promise<ApiShoppingList> {
    return this.request<ApiShoppingList>(
      `/shoppingList/get?id=${encodeURIComponent(id)}`,
    );
  }

  async getMyShoppingLists(
    pageIndex: number = 0,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<ApiShoppingList>> {
    return this.request<PaginatedResponse<ApiShoppingList>>(
      `/shoppingList/myList?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    );
  }

  async updateShoppingList(id: string, name: string): Promise<ApiShoppingList> {
    return this.request<ApiShoppingList>("/shoppingList/update", {
      method: "PUT",
      body: JSON.stringify({ id, name }),
    });
  }

  async deleteShoppingList(
    id: string,
  ): Promise<{ success: boolean; id: string; awid: string }> {
    return this.request<{ success: boolean; id: string; awid: string }>(
      "/shoppingList/delete",
      {
        method: "DELETE",
        body: JSON.stringify({ id }),
      },
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to ${this.baseUrl}`);
      const result = await this.getMyShoppingLists(0, 1);
      console.log("Connection test successful:", result);
      return true;
    } catch (error) {
      console.error("Backend connection failed:", error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export type { ApiShoppingList, PaginatedResponse };
