"use client";

import { ShoppingList } from "@/types";

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onEdit: (list: ShoppingList) => void;
  onDelete: (id: string) => void;
  onAddIngredients: (list: ShoppingList) => void;
}

export default function ShoppingListCard({
  shoppingList,
  onEdit,
  onDelete,
  onAddIngredients,
}: ShoppingListCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {shoppingList.name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(shoppingList)}
            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 rounded-md font-medium text-sm transition-colors border border-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(shoppingList.id)}
            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 rounded-md font-medium text-sm transition-colors border border-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Ingredients ({shoppingList.ingredients.length}):
        </p>
        {shoppingList.ingredients.length === 0 ? (
          <p className="text-gray-500 italic">No ingredients added yet</p>
        ) : (
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {shoppingList.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm"
              >
                • {ingredient}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAddIngredients(shoppingList)}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
        >
          {shoppingList.ingredients.length === 0
            ? "Add Ingredients"
            : "Manage Ingredients"}
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Created: {shoppingList.createdAt.toLocaleDateString()}
      </div>
    </div>
  );
}
