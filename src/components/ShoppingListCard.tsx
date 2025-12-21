"use client";

import { ShoppingList } from "@/types";

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onEdit: (list: ShoppingList) => void;
  onDelete: (list: ShoppingList) => void;
  onAddIngredients: (list: ShoppingList) => void;
  onViewDetail: (list: ShoppingList) => void;
  onToggleDone: (list: ShoppingList) => void;
}

export default function ShoppingListCard({
  shoppingList,
  onEdit,
  onDelete,
  onAddIngredients,
  onViewDetail,
  onToggleDone,
}: ShoppingListCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 hover:shadow-lg transition-all ${
        shoppingList.done ? "border-green-400 bg-green-50" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3
            className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onViewDetail(shoppingList)}
          >
            {shoppingList.name}
            {shoppingList.done && (
              <span className="ml-2 text-green-600 text-sm">✓ Hotovo</span>
            )}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleDone(shoppingList)}
            className={`px-3 py-1 rounded-md font-medium text-sm transition-colors border ${
              shoppingList.done
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                : "bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
            }`}
          >
            {shoppingList.done ? "Zrušit" : "Hotovo"}
          </button>
          <button
            onClick={() => onEdit(shoppingList)}
            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 rounded-md font-medium text-sm transition-colors border border-blue-200"
          >
            Upravit
          </button>
          <button
            onClick={() => onDelete(shoppingList)}
            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 rounded-md font-medium text-sm transition-colors border border-red-200"
          >
            Smazat
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Ingredience ({shoppingList.ingredients.length}):
        </p>
        {shoppingList.ingredients.length === 0 ? (
          <p className="text-gray-500 italic">Zatím žádné ingredience</p>
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
          onClick={() => onViewDetail(shoppingList)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Zobrazit detail
        </button>
        <button
          onClick={() => onAddIngredients(shoppingList)}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
        >
          {shoppingList.ingredients.length === 0
            ? "Přidat ingredience"
            : "Spravovat ingredience"}
        </button>
      </div>
    </div>
  );
}
