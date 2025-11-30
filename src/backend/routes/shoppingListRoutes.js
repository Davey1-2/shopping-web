import express from 'express';
import { createShoppingList, getShoppingList, myListShoppingList, updateShoppingList, deleteShoppingList } from '../controllers/shoppingListController.js';

const router = express.Router();

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

export default router;
