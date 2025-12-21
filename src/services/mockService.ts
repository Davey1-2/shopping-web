import { ApiShoppingList, PaginatedResponse } from "./api";
import { v4 as uuidv4 } from "uuid";

const MOCK_DELAY = 300;

const MOCK_SHOPPING_LISTS: ApiShoppingList[] = [
  {
    awid: uuidv4(),
    id: "1",
    name: "týdenní nákup",
    category: "běžné věci",
    state: "active",
    ownerId: "frontend-user",
    items: [
      {
        id: "1",
        name: "rohlíky",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "máslo",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "jogurt",
        completed: true,
        addedAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "banány",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "5",
        name: "šunka",
        completed: false,
        addedAt: new Date().toISOString(),
      },
    ],
    done: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    awid: uuidv4(),
    id: "2",
    name: "party supplies",
    category: "zábava",
    state: "active",
    ownerId: "frontend-user",
    items: [
      {
        id: "6",
        name: "čipsy",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "7",
        name: "cola",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "8",
        name: "pizza",
        completed: true,
        addedAt: new Date().toISOString(),
      },
    ],
    done: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    awid: uuidv4(),
    id: "3",
    name: "zdravé jídlo",
    category: "zdraví",
    state: "active",
    ownerId: "frontend-user",
    items: [
      {
        id: "9",
        name: "brokolice",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "10",
        name: "quinoa",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "11",
        name: "avokádo",
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: "12",
        name: "losos",
        completed: true,
        addedAt: new Date().toISOString(),
      },
    ],
    done: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

class MockService {
  private lists: ApiShoppingList[] = [...MOCK_SHOPPING_LISTS];

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  }

  private generateId(): string {
    return Date.now().toString();
  }

  async createShoppingList(
    name: string,
    category?: string,
  ): Promise<ApiShoppingList> {
    await this.delay();

    const newList: ApiShoppingList = {
      awid: uuidv4(),
      id: this.generateId(),
      name: name.trim(),
      category: category ? category.trim() : "Obecné",
      state: "active",
      ownerId: "frontend-user",
      items: [],
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.lists.push(newList);
    return newList;
  }

  async getShoppingList(id: string): Promise<ApiShoppingList> {
    await this.delay();

    const list = this.lists.find((l) => l.id === id || l.awid === id);
    if (!list) {
      throw new Error(`Shopping list with ID '${id}' not found`);
    }

    return list;
  }

  async getMyShoppingLists(
    pageIndex: number = 0,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<ApiShoppingList>> {
    await this.delay();

    const activeLists = this.lists.filter((list) => list.state === "active");
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLists = activeLists.slice(startIndex, endIndex);

    return {
      itemList: paginatedLists,
      pageInfo: {
        pageIndex,
        pageSize,
        total: activeLists.length,
        totalPages: Math.ceil(activeLists.length / pageSize),
      },
    };
  }

  async updateShoppingList(
    id: string,
    name: string,
    done?: boolean,
  ): Promise<ApiShoppingList> {
    await this.delay();

    const listIndex = this.lists.findIndex((l) => l.id === id || l.awid === id);
    if (listIndex === -1) {
      throw new Error(`Shopping list with ID '${id}' not found`);
    }

    this.lists[listIndex] = {
      ...this.lists[listIndex],
      name: name.trim(),
      ...(done !== undefined ? { done } : {}),
      updatedAt: new Date().toISOString(),
    };

    return this.lists[listIndex];
  }

  async deleteShoppingList(
    id: string,
  ): Promise<{ success: boolean; id: string; awid: string }> {
    await this.delay();

    const listIndex = this.lists.findIndex((l) => l.id === id || l.awid === id);
    if (listIndex === -1) {
      throw new Error(`Shopping list with ID '${id}' not found`);
    }

    const list = this.lists[listIndex];

    this.lists[listIndex] = {
      ...list,
      state: "deleted",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      id: list.id,
      awid: list.awid,
    };
  }

  async testConnection(): Promise<boolean> {
    await this.delay();
    return true;
  }

  resetData(): void {
    this.lists = [...MOCK_SHOPPING_LISTS];
  }

  getAllLists(): ApiShoppingList[] {
    return [...this.lists];
  }
}

export const mockService = new MockService();
