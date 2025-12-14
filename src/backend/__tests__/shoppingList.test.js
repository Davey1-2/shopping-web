import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import shoppingListRoutes from "../routes/shoppingListRoutes.js";
import ShoppingList from "../models/ShoppingList.js";

let mongoServer;
let app;

//setup Express app for testing
const setupApp = () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/shoppingList", shoppingListRoutes);
  return testApp;
};

beforeAll(async () => {
  //create MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  app = setupApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await ShoppingList.deleteMany({});
});

describe("Shopping List API Tests", () => {
  //create tests
  describe("POST /shoppingList/create", () => {
    test("should create a new shopping list successfully (happy day)", async () => {
      const newList = {
        name: "Groceries",
        category: "Food",
      };

      const response = await request(app)
        .post("/shoppingList/create")
        .set("x-user-identity", "testUser123")
        .send(newList)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("awid");
      expect(response.body.name).toBe("Groceries");
      expect(response.body.category).toBe("Food");
      expect(response.body.state).toBe("active");
      expect(response.body.ownerId).toBe("testUser123");
      expect(response.body.items).toEqual([]);
    });

    test("should create shopping list with default category when not provided (happy day)", async () => {
      const newList = {
        name: "Weekly Shopping",
      };

      const response = await request(app)
        .post("/shoppingList/create")
        .set("x-user-identity", "testUser123")
        .send(newList)
        .expect(200);

      expect(response.body.name).toBe("Weekly Shopping");
      expect(response.body.category).toBe("Obecné");
    });

    test("should fail when name is missing (alternative scenario)", async () => {
      const invalidList = {
        category: "Food",
      };

      const response = await request(app)
        .post("/shoppingList/create")
        .set("x-user-identity", "testUser123")
        .send(invalidList)
        .expect(400);

      expect(response.body).toHaveProperty("errorMap");
      expect(response.body.errorMap.validationError).toBeDefined();
      expect(response.body.errorMap.validationError.paramMap.errors).toContain(
        "Name is required and must be a non-empty string",
      );
    });

    test("should fail when name is empty string", async () => {
      const invalidList = {
        name: "   ",
        category: "Food",
      };

      const response = await request(app)
        .post("/shoppingList/create")
        .set("x-user-identity", "testUser123")
        .send(invalidList)
        .expect(400);

      expect(response.body.errorMap.validationError).toBeDefined();
    });

    test("should fail when name exceeds 100 characters", async () => {
      const invalidList = {
        name: "A".repeat(101),
        category: "Food",
      };

      const response = await request(app)
        .post("/shoppingList/create")
        .set("x-user-identity", "testUser123")
        .send(invalidList)
        .expect(400);

      expect(response.body.errorMap.validationError.paramMap.errors).toContain(
        "Name must not exceed 100 characters",
      );
    });
  });

  //get single list tests
  describe("GET /shoppingList/get", () => {
    test("should retrieve a shopping list by ID successfully (happy day)", async () => {
      //create a test shopping list first
      const testList = await ShoppingList.create({
        awid: "test-awid-123",
        name: "Test List",
        category: "Test",
        state: "active",
        ownerId: "testUser123",
        items: [],
      });

      const response = await request(app)
        .get("/shoppingList/get")
        .set("x-user-identity", "testUser123")
        .query({ id: testList._id.toString() })
        .expect(200);

      expect(response.body.id).toBe(testList._id.toString());
      expect(response.body.name).toBe("Test List");
      expect(response.body.category).toBe("Test");
      expect(response.body.awid).toBe("test-awid-123");
    });

    test("should retrieve a shopping list with items successfully (happy day)", async () => {
      const testList = await ShoppingList.create({
        awid: "test-awid-456",
        name: "List with Items",
        category: "Shopping",
        state: "active",
        ownerId: "testUser123",
        items: [
          { id: "item1", name: "Milk", completed: false },
          { id: "item2", name: "Bread", completed: true },
        ],
      });

      const response = await request(app)
        .get("/shoppingList/get")
        .set("x-user-identity", "testUser123")
        .query({ id: testList._id.toString() })
        .expect(200);

      expect(response.body.id).toBe(testList._id.toString());
      expect(response.body.name).toBe("List with Items");
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].name).toBe("Milk");
    });

    test("should fail when ID is not provided", async () => {
      const response = await request(app)
        .get("/shoppingList/get")
        .set("x-user-identity", "testUser123")
        .query({})
        .expect(400);

      expect(response.body.errorMap.validationError).toBeDefined();
      expect(response.body.errorMap.validationError.paramMap.errors).toContain(
        "ID is required and must be a non-empty string",
      );
    });

    test("should fail when shopping list not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get("/shoppingList/get")
        .set("x-user-identity", "testUser123")
        .query({ id: nonExistentId })
        .expect(404);

      expect(response.body.errorMap.shoppingListNotFound).toBeDefined();
      expect(response.body.errorMap.shoppingListNotFound.message).toContain(
        "not found",
      );
    });

    test("should not retrieve deleted shopping list", async () => {
      const deletedList = await ShoppingList.create({
        awid: "deleted-list",
        name: "Deleted List",
        category: "Test",
        state: "deleted",
        ownerId: "testUser123",
        items: [],
      });

      const response = await request(app)
        .get("/shoppingList/get")
        .set("x-user-identity", "testUser123")
        .query({ id: deletedList._id.toString() })
        .expect(404);

      expect(response.body.errorMap.shoppingListNotFound).toBeDefined();
    });
  });

  //list all tests (myList)
  describe("GET /shoppingList/myList", () => {
    test("should retrieve all shopping lists for user (happy day)", async () => {
      //create multiple shopping lists for the user
      await ShoppingList.create([
        {
          awid: "list-1",
          name: "List 1",
          category: "Food",
          state: "active",
          ownerId: "testUser123",
          items: [],
        },
        {
          awid: "list-2",
          name: "List 2",
          category: "Shopping",
          state: "active",
          ownerId: "testUser123",
          items: [{ id: "item1", name: "Item 1", completed: false }],
        },
        {
          awid: "list-3",
          name: "Other User List",
          category: "Food",
          state: "active",
          ownerId: "otherUser",
          items: [],
        },
      ]);

      const response = await request(app)
        .get("/shoppingList/myList")
        .set("x-user-identity", "testUser123")
        .expect(200);

      expect(response.body.itemList).toHaveLength(2);
      expect(response.body.pageInfo.total).toBe(2);
      expect(response.body.itemList[0]).toHaveProperty("id");
      expect(response.body.itemList[0]).toHaveProperty("name");
      expect(response.body.itemList[0]).toHaveProperty("itemCount");
    });

    test("should return empty list when user has no shopping lists (happy day)", async () => {
      const response = await request(app)
        .get("/shoppingList/myList")
        .set("x-user-identity", "newUser")
        .expect(200);

      expect(response.body.itemList).toHaveLength(0);
      expect(response.body.pageInfo.total).toBe(0);
    });

    test("should paginate results correctly", async () => {
      //create 15 shopping lists
      const lists = [];
      for (let i = 1; i <= 15; i++) {
        lists.push({
          awid: `list-${i}`,
          name: `List ${i}`,
          category: "Test",
          state: "active",
          ownerId: "testUser123",
          items: [],
        });
      }
      await ShoppingList.create(lists);

      //get first page
      const response1 = await request(app)
        .get("/shoppingList/myList")
        .set("x-user-identity", "testUser123")
        .query({ pageIndex: 0, pageSize: 10 })
        .expect(200);

      expect(response1.body.itemList).toHaveLength(10);
      expect(response1.body.pageInfo.total).toBe(15);
      expect(response1.body.pageInfo.totalPages).toBe(2);

      //get second page
      const response2 = await request(app)
        .get("/shoppingList/myList")
        .set("x-user-identity", "testUser123")
        .query({ pageIndex: 1, pageSize: 10 })
        .expect(200);

      expect(response2.body.itemList).toHaveLength(5);
    });

    test("should not include deleted lists", async () => {
      await ShoppingList.create([
        {
          awid: "active-list",
          name: "Active List",
          category: "Food",
          state: "active",
          ownerId: "testUser123",
          items: [],
        },
        {
          awid: "deleted-list",
          name: "Deleted List",
          category: "Food",
          state: "deleted",
          ownerId: "testUser123",
          items: [],
        },
      ]);

      const response = await request(app)
        .get("/shoppingList/myList")
        .set("x-user-identity", "testUser123")
        .expect(200);

      expect(response.body.itemList).toHaveLength(1);
      expect(response.body.itemList[0].name).toBe("Active List");
    });
  });

  //update tests
  describe("PUT /shoppingList/update", () => {
    test("should update shopping list successfully (happy day)", async () => {
      const testList = await ShoppingList.create({
        awid: "update-test",
        name: "Original Name",
        category: "Food",
        state: "active",
        ownerId: "testUser123",
        items: [],
      });

      const updateData = {
        id: testList._id.toString(),
        name: "Updated Name",
      };

      const response = await request(app)
        .put("/shoppingList/update")
        .set("x-user-identity", "testUser123")
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated Name");
      expect(response.body.id).toBe(testList._id.toString());
    });

    test("should fail when ID is missing", async () => {
      const updateData = {
        name: "Updated Name",
      };

      const response = await request(app)
        .put("/shoppingList/update")
        .set("x-user-identity", "testUser123")
        .send(updateData)
        .expect(400);

      expect(response.body.errorMap.validationError).toBeDefined();
    });

    test("should fail when name is missing", async () => {
      const testList = await ShoppingList.create({
        awid: "test-list",
        name: "Test List",
        category: "Food",
        state: "active",
        ownerId: "testUser123",
        items: [],
      });

      const updateData = {
        id: testList._id.toString(),
      };

      const response = await request(app)
        .put("/shoppingList/update")
        .set("x-user-identity", "testUser123")
        .send(updateData)
        .expect(400);

      expect(response.body.errorMap.validationError).toBeDefined();
    });

    test("should fail when user is not the owner", async () => {
      const testList = await ShoppingList.create({
        awid: "other-user-list",
        name: "Other User List",
        category: "Food",
        state: "active",
        ownerId: "otherUser",
        items: [],
      });

      const updateData = {
        id: testList._id.toString(),
        name: "Hacked Name",
      };

      const response = await request(app)
        .put("/shoppingList/update")
        .set("x-user-identity", "testUser123")
        .send(updateData)
        .expect(403);

      expect(response.body.errorMap.unauthorizedAccess).toBeDefined();
      expect(response.body.errorMap.unauthorizedAccess.message).toContain(
        "Only the owner",
      );
    });

    test("should fail when shopping list not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const updateData = {
        id: nonExistentId,
        name: "Updated Name",
      };

      const response = await request(app)
        .put("/shoppingList/update")
        .set("x-user-identity", "testUser123")
        .send(updateData)
        .expect(404);

      expect(response.body.errorMap.shoppingListNotFound).toBeDefined();
    });
  });

  //delete tests
  describe("DELETE /shoppingList/delete", () => {
    test("should delete shopping list successfully (happy day)", async () => {
      const testList = await ShoppingList.create({
        awid: "delete-test",
        name: "List to Delete",
        category: "Food",
        state: "active",
        ownerId: "testUser123",
        items: [],
      });

      const deleteData = {
        id: testList._id.toString(),
      };

      const response = await request(app)
        .delete("/shoppingList/delete")
        .set("x-user-identity", "testUser123")
        .send(deleteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBe(testList._id.toString());

      //verify that the list is marked as deleted
      const deletedList = await ShoppingList.findById(testList._id);
      expect(deletedList.state).toBe("deleted");
    });

    test("should fail when ID is missing", async () => {
      const response = await request(app)
        .delete("/shoppingList/delete")
        .set("x-user-identity", "testUser123")
        .send({})
        .expect(400);

      expect(response.body.errorMap.validationError).toBeDefined();
    });

    test("should fail when user is not the owner", async () => {
      const testList = await ShoppingList.create({
        awid: "protected-list",
        name: "Protected List",
        category: "Food",
        state: "active",
        ownerId: "otherUser",
        items: [],
      });

      const deleteData = {
        id: testList._id.toString(),
      };

      const response = await request(app)
        .delete("/shoppingList/delete")
        .set("x-user-identity", "testUser123")
        .send(deleteData)
        .expect(403);

      expect(response.body.errorMap.unauthorizedAccess).toBeDefined();
      expect(response.body.errorMap.unauthorizedAccess.message).toContain(
        "Only the owner",
      );
    });

    test("should fail when shopping list not found (alternative scenario)", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const deleteData = {
        id: nonExistentId,
      };

      const response = await request(app)
        .delete("/shoppingList/delete")
        .set("x-user-identity", "testUser123")
        .send(deleteData)
        .expect(404);

      expect(response.body.errorMap.shoppingListNotFound).toBeDefined();
    });

    test("should fail when trying to delete already deleted list (alternative scenario)", async () => {
      const testList = await ShoppingList.create({
        awid: "already-deleted",
        name: "Already Deleted",
        category: "Food",
        state: "deleted",
        ownerId: "testUser123",
        items: [],
      });

      const deleteData = {
        id: testList._id.toString(),
      };

      const response = await request(app)
        .delete("/shoppingList/delete")
        .set("x-user-identity", "testUser123")
        .send(deleteData)
        .expect(404);

      expect(response.body.errorMap.shoppingListNotFound).toBeDefined();
    });
  });
});
