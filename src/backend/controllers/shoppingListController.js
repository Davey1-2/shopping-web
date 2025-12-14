import { v4 as uuidv4 } from "uuid";
import ShoppingList from "../models/ShoppingList.js";

const validateCreateShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  if (
    !dtoIn.name ||
    typeof dtoIn.name !== "string" ||
    dtoIn.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }
  if (dtoIn.name && dtoIn.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  if (dtoIn.category && typeof dtoIn.category !== "string") {
    errors.push("Category must be a string");
  }
  if (dtoIn.category && dtoIn.category.length > 50) {
    errors.push("Category must not exceed 50 characters");
  }
  return errors;
};

const validateGetShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  if (
    !dtoIn.id ||
    typeof dtoIn.id !== "string" ||
    dtoIn.id.trim().length === 0
  ) {
    errors.push("ID is required and must be a non-empty string");
  }
  return errors;
};

const validateUpdateShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  if (!dtoIn.id || typeof dtoIn.id !== "string") {
    errors.push("ID is required and must be a string");
  }
  if (
    !dtoIn.name ||
    typeof dtoIn.name !== "string" ||
    dtoIn.name.trim().length === 0
  ) {
    errors.push("Name is required and must be a non-empty string");
  }
  if (dtoIn.name && dtoIn.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  return errors;
};

const validateDeleteShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  if (!dtoIn.id || typeof dtoIn.id !== "string") {
    errors.push("ID is required and must be a string");
  }
  return errors;
};

export const createShoppingList = async (req, res) => {
  try {
    const dtoIn = req.body;
    const validationErrors = validateCreateShoppingListDtoIn(dtoIn);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        errorMap: {
          validationError: {
            type: "error",
            message: "Input validation failed",
            paramMap: { errors: validationErrors },
          },
        },
      });
    }

    const newShoppingList = new ShoppingList({
      awid: uuidv4(),
      name: dtoIn.name.trim(),
      category: dtoIn.category ? dtoIn.category.trim() : "Obecné",
      state: "active",
      ownerId: req.user?.uuIdentity || "anonymous",
      items: [],
    });

    const savedList = await newShoppingList.save();

    const dtoOut = {
      awid: savedList.awid,
      id: savedList._id.toString(),
      name: savedList.name,
      category: savedList.category,
      state: savedList.state,
      ownerId: savedList.ownerId,
      items: savedList.items,
      createdAt: savedList.createdAt,
      updatedAt: savedList.updatedAt,
    };

    res.status(200).json(dtoOut);
  } catch (err) {
    console.error("Error in createShoppingList:", err);
    res.status(500).json({
      errorMap: {
        serverError: {
          type: "error",
          message: "Internal Server Error",
          paramMap: { error: err.message },
        },
      },
    });
  }
};

export const getShoppingList = async (req, res) => {
  try {
    const dtoIn = req.query;
    const validationErrors = validateGetShoppingListDtoIn(dtoIn);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        errorMap: {
          validationError: {
            type: "error",
            message: "Input validation failed",
            paramMap: { errors: validationErrors },
          },
        },
      });
    }

    const shoppingList = await ShoppingList.findOne({
      $or: [{ _id: dtoIn.id }, { awid: dtoIn.id }],
      state: { $ne: "deleted" },
    });

    if (!shoppingList) {
      return res.status(404).json({
        errorMap: {
          shoppingListNotFound: {
            type: "error",
            message: `Shopping list with ID '${dtoIn.id}' not found`,
            paramMap: { id: dtoIn.id },
          },
        },
      });
    }

    const dtoOut = {
      awid: shoppingList.awid,
      id: shoppingList._id.toString(),
      name: shoppingList.name,
      category: shoppingList.category,
      state: shoppingList.state,
      ownerId: shoppingList.ownerId,
      items: shoppingList.items,
      createdAt: shoppingList.createdAt,
      updatedAt: shoppingList.updatedAt,
    };

    res.status(200).json(dtoOut);
  } catch (err) {
    console.error("Error in getShoppingList:", err);
    res.status(500).json({
      errorMap: {
        serverError: {
          type: "error",
          message: "Internal Server Error",
          paramMap: { error: err.message },
        },
      },
    });
  }
};

export const myListShoppingList = async (req, res) => {
  try {
    const dtoIn = req.query;
    const userIdentity = req.user?.uuIdentity;

    const pageIndex = parseInt(dtoIn.pageIndex) || 0;
    const pageSize = Math.min(parseInt(dtoIn.pageSize) || 10, 100);
    const skip = pageIndex * pageSize;

    const filter = {
      ownerId: userIdentity,
      state: { $ne: "deleted" },
    };

    const [lists, total] = await Promise.all([
      ShoppingList.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ShoppingList.countDocuments(filter),
    ]);

    const itemList = lists.map((list) => ({
      awid: list.awid,
      id: list._id.toString(),
      name: list.name,
      state: list.state,
      ownerId: list.ownerId,
      itemCount: list.items?.length || 0,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));

    const dtoOut = {
      itemList,
      pageInfo: {
        pageIndex,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    res.status(200).json(dtoOut);
  } catch (err) {
    console.error("Error in myListShoppingList:", err);
    res.status(500).json({
      errorMap: {
        serverError: {
          type: "error",
          message: "Internal server error",
          paramMap: { error: err.message },
        },
      },
    });
  }
};

export const updateShoppingList = async (req, res) => {
  try {
    const dtoIn = req.body;
    const userIdentity = req.user?.uuIdentity;
    const validationErrors = validateUpdateShoppingListDtoIn(dtoIn);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        errorMap: {
          validationError: {
            type: "error",
            message: "Validation failed",
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce(
                (acc, error, index) => {
                  acc[`error${index}`] = error;
                  return acc;
                },
                {},
              ),
            },
          },
        },
      });
    }

    const shoppingList = await ShoppingList.findOne({
      $or: [{ _id: dtoIn.id }, { awid: dtoIn.id }],
      state: { $ne: "deleted" },
    });

    if (!shoppingList) {
      return res.status(404).json({
        errorMap: {
          shoppingListNotFound: {
            type: "error",
            message: "Shopping list not found",
            paramMap: { id: dtoIn.id },
          },
        },
      });
    }

    if (shoppingList.ownerId !== userIdentity) {
      return res.status(403).json({
        errorMap: {
          unauthorizedAccess: {
            type: "error",
            message: "Only the owner can update this shopping list",
            paramMap: { id: dtoIn.id },
          },
        },
      });
    }

    shoppingList.name = dtoIn.name.trim();
    shoppingList.updatedAt = new Date();

    const updatedList = await shoppingList.save();

    const dtoOut = {
      awid: updatedList.awid,
      id: updatedList._id.toString(),
      name: updatedList.name,
      state: updatedList.state,
      ownerId: updatedList.ownerId,
      items: updatedList.items,
      createdAt: updatedList.createdAt,
      updatedAt: updatedList.updatedAt,
    };

    res.status(200).json(dtoOut);
  } catch (err) {
    console.error("Error in updateShoppingList:", err);
    res.status(500).json({
      errorMap: {
        serverError: {
          type: "error",
          message: "Internal server error",
          paramMap: { error: err.message },
        },
      },
    });
  }
};

export const deleteShoppingList = async (req, res) => {
  try {
    const dtoIn = req.body;
    const userIdentity = req.user?.uuIdentity;
    const validationErrors = validateDeleteShoppingListDtoIn(dtoIn);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        errorMap: {
          validationError: {
            type: "error",
            message: "Validation failed",
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce(
                (acc, error, index) => {
                  acc[`error${index}`] = error;
                  return acc;
                },
                {},
              ),
            },
          },
        },
      });
    }

    const shoppingList = await ShoppingList.findOne({
      $or: [{ _id: dtoIn.id }, { awid: dtoIn.id }],
      state: { $ne: "deleted" },
    });

    if (!shoppingList) {
      return res.status(404).json({
        errorMap: {
          shoppingListNotFound: {
            type: "error",
            message: "Shopping list not found",
            paramMap: { id: dtoIn.id },
          },
        },
      });
    }

    if (shoppingList.ownerId !== userIdentity) {
      return res.status(403).json({
        errorMap: {
          unauthorizedAccess: {
            type: "error",
            message: "Only the owner can delete this shopping list",
            paramMap: { id: dtoIn.id },
          },
        },
      });
    }

    shoppingList.state = "deleted";
    shoppingList.updatedAt = new Date();
    await shoppingList.save();

    const dtoOut = {
      success: true,
      id: shoppingList._id.toString(),
      awid: shoppingList.awid,
    };

    res.status(200).json(dtoOut);
  } catch (err) {
    console.error("Error in deleteShoppingList:", err);
    res.status(500).json({
      errorMap: {
        serverError: {
          type: "error",
          message: "Internal server error",
          paramMap: { error: err.message },
        },
      },
    });
  }
};
