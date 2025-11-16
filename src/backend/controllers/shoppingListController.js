const { v4: uuidv4 } = require('uuid');

let shoppingLists = [];

const validateCreateShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  
  if (!dtoIn.name || typeof dtoIn.name !== 'string' || dtoIn.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  return errors;
};

const validateGetShoppingListDtoIn = (dtoIn) => {
  const errors = [];
  
  if (!dtoIn.id || typeof dtoIn.id !== 'string') {
    errors.push('ID is required and must be a string');
  }
  
  return errors;
};

const createShoppingList = (req, res) => {
  try {
    const dtoIn = req.body;
    
    const validationErrors = validateCreateShoppingListDtoIn(dtoIn);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        uuAppErrorMap: {
          validationError: {
            type: 'error',
            message: 'Validation failed',
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce((acc, error, index) => {
                acc[`error${index}`] = error;
                return acc;
              }, {})
            }
          }
        }
      });
    }

    const newShoppingList = {
      awid: uuidv4(),
      id: uuidv4(),
      name: dtoIn.name.trim(),
      state: 'active',
      ownerUuIdentity: req.user?.uuIdentity || 'anonymous'
    };

    shoppingLists.push(newShoppingList);

    const dtoOut = {
      awid: newShoppingList.awid,
      id: newShoppingList.id,
      name: newShoppingList.name,
      state: newShoppingList.state,
      ownerUuIdentity: newShoppingList.ownerUuIdentity
    };

    res.status(200).json(dtoOut);
    
  } catch (error) {
    res.status(500).json({
      uuAppErrorMap: {
        serverError: {
          type: 'error',
          message: 'Internal server error',
          paramMap: {}
        }
      }
    });
  }
};

const getShoppingList = (req, res) => {
  try {
    const dtoIn = req.query;
    
    const validationErrors = validateGetShoppingListDtoIn(dtoIn);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        uuAppErrorMap: {
          validationError: {
            type: 'error',
            message: 'Validation failed',
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce((acc, error, index) => {
                acc[`error${index}`] = error;
                return acc;
              }, {})
            }
          }
        }
      });
    }

    const shoppingList = shoppingLists.find(list => list.id === dtoIn.id);
    
    if (!shoppingList) {
      return res.status(404).json({
        uuAppErrorMap: {
          shoppingListNotFound: {
            type: 'error',
            message: 'Shopping list not found',
            paramMap: {
              id: dtoIn.id
            }
          }
        }
      });
    }

    const dtoOut = {
      awid: shoppingList.awid,
      id: shoppingList.id,
      name: shoppingList.name,
      state: shoppingList.state,
      ownerUuIdentity: shoppingList.ownerUuIdentity
    };

    res.status(200).json(dtoOut);
    
  } catch (error) {
    res.status(500).json({
      uuAppErrorMap: {
        serverError: {
          type: 'error',
          message: 'Internal server error',
          paramMap: {}
        }
      }
    });
  }
};

const myListShoppingList = (req, res) => {
  try {
    const dtoIn = req.query;
    const userIdentity = req.user?.uuIdentity;
    
    const pageIndex = parseInt(dtoIn.pageIndex) || 0;
    const pageSize = parseInt(dtoIn.pageSize) || 10;
    
    const userLists = shoppingLists.filter(list => list.ownerUuIdentity === userIdentity);
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLists = userLists.slice(startIndex, endIndex);
    
    const dtoOut = {
      itemList: paginatedLists.map(list => ({
        awid: list.awid,
        id: list.id,
        name: list.name,
        state: list.state,
        ownerUuIdentity: list.ownerUuIdentity
      })),
      pageInfo: {
        pageIndex: pageIndex,
        pageSize: pageSize,
        total: userLists.length
      }
    };

    res.status(200).json(dtoOut);
    
  } catch (error) {
    res.status(500).json({
      uuAppErrorMap: {
        serverError: {
          type: 'error',
          message: 'Internal server error',
          paramMap: {}
        }
      }
    });
  }
};

const updateShoppingList = (req, res) => {
  try {
    const dtoIn = req.body;
    const userIdentity = req.user?.uuIdentity;
    
    const validationErrors = [];
    if (!dtoIn.id || typeof dtoIn.id !== 'string') {
      validationErrors.push('ID is required and must be a string');
    }
    if (!dtoIn.name || typeof dtoIn.name !== 'string' || dtoIn.name.trim().length === 0) {
      validationErrors.push('Name is required and must be a non-empty string');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        uuAppErrorMap: {
          validationError: {
            type: 'error',
            message: 'Validation failed',
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce((acc, error, index) => {
                acc[`error${index}`] = error;
                return acc;
              }, {})
            }
          }
        }
      });
    }

    const shoppingListIndex = shoppingLists.findIndex(list => list.id === dtoIn.id);
    
    if (shoppingListIndex === -1) {
      return res.status(404).json({
        uuAppErrorMap: {
          shoppingListNotFound: {
            type: 'error',
            message: 'Shopping list not found',
            paramMap: {
              id: dtoIn.id
            }
          }
        }
      });
    }

    const shoppingList = shoppingLists[shoppingListIndex];
    
    if (shoppingList.ownerUuIdentity !== userIdentity) {
      return res.status(403).json({
        uuAppErrorMap: {
          unauthorizedAccess: {
            type: 'error',
            message: 'Only the owner can update this shopping list',
            paramMap: {
              id: dtoIn.id
            }
          }
        }
      });
    }

    shoppingLists[shoppingListIndex] = {
      ...shoppingList,
      name: dtoIn.name.trim()
    };

    const dtoOut = {
      awid: shoppingLists[shoppingListIndex].awid,
      id: shoppingLists[shoppingListIndex].id,
      name: shoppingLists[shoppingListIndex].name,
      state: shoppingLists[shoppingListIndex].state,
      ownerUuIdentity: shoppingLists[shoppingListIndex].ownerUuIdentity
    };

    res.status(200).json(dtoOut);
    
  } catch (error) {
    res.status(500).json({
      uuAppErrorMap: {
        serverError: {
          type: 'error',
          message: 'Internal server error',
          paramMap: {}
        }
      }
    });
  }
};

const deleteShoppingList = (req, res) => {
  try {
    const dtoIn = req.body;
    const userIdentity = req.user?.uuIdentity;
    
    const validationErrors = [];
    if (!dtoIn.id || typeof dtoIn.id !== 'string') {
      validationErrors.push('ID is required and must be a string');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        uuAppErrorMap: {
          validationError: {
            type: 'error',
            message: 'Validation failed',
            paramMap: {
              missingKeyMap: {},
              invalidValueKeyMap: validationErrors.reduce((acc, error, index) => {
                acc[`error${index}`] = error;
                return acc;
              }, {})
            }
          }
        }
      });
    }

    const shoppingListIndex = shoppingLists.findIndex(list => list.id === dtoIn.id);
    
    if (shoppingListIndex === -1) {
      return res.status(404).json({
        uuAppErrorMap: {
          shoppingListNotFound: {
            type: 'error',
            message: 'Shopping list not found',
            paramMap: {
              id: dtoIn.id
            }
          }
        }
      });
    }

    const shoppingList = shoppingLists[shoppingListIndex];
    
    if (shoppingList.ownerUuIdentity !== userIdentity) {
      return res.status(403).json({
        uuAppErrorMap: {
          unauthorizedAccess: {
            type: 'error',
            message: 'Only the owner can delete this shopping list',
            paramMap: {
              id: dtoIn.id
            }
          }
        }
      });
    }

    shoppingLists.splice(shoppingListIndex, 1);

    const dtoOut = {
      success: true
    };

    res.status(200).json(dtoOut);
    
  } catch (error) {
    res.status(500).json({
      uuAppErrorMap: {
        serverError: {
          type: 'error',
          message: 'Internal server error',
          paramMap: {}
        }
      }
    });
  }
};

module.exports = {
  createShoppingList,
  getShoppingList,
  myListShoppingList,
  updateShoppingList,
  deleteShoppingList
};
