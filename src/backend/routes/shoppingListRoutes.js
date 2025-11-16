const express = require('express');
const router = express.Router();
const { createShoppingList, getShoppingList, myListShoppingList, updateShoppingList, deleteShoppingList } = require('../controllers/shoppingListController');

const authMiddleware = (req, res, next) => {
  req.user = {
    uuIdentity: req.headers['x-user-identity'] || 'anonymous'
  };
  next();
};

router.use(authMiddleware);

router.post('/create', createShoppingList);

router.get('/get', getShoppingList);

router.get('/myList', myListShoppingList);

router.put('/update', updateShoppingList);

router.delete('/delete', deleteShoppingList);

module.exports = router;
