"use client";

import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { ModalProps } from "@/types";

export default function Modal({
  isOpen,
  onClose,
  onSave,
  title,
  initialIngredients = [],
  initialName = "",
  mode,
}: ModalProps) {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [listName, setListName] = useState(initialName);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    setIngredients(initialIngredients);
    setListName(initialName);
    setEditingIndex(null);
    setEditingValue("");
  }, [initialIngredients, initialName, isOpen]);

  const addIngredient = () => {
    if (
      currentIngredient.trim() &&
      !ingredients.includes(currentIngredient.trim())
    ) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(ingredients[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newIngredients = [...ingredients];
      newIngredients[editingIndex] = editingValue.trim();
      setIngredients(newIngredients);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleSave = () => {
    if (mode === "edit" && !listName.trim()) {
      return;
    }
    onSave(ingredients, listName);
    onClose();
    setIngredients([]);
    setCurrentIngredient("");
    setListName("");
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleClose = () => {
    onClose();
    setIngredients(initialIngredients);
    setCurrentIngredient("");
    setListName(initialName);
    setEditingIndex(null);
    setEditingValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          {mode === "edit" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název nákupního seznamu
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Zadejte název seznamu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              placeholder="Zadejte ingredienci..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Přidat
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {ingredients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Zatím žádné ingredience
              </p>
            ) : (
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md"
                  >
                    {editingIndex === index ? (
                      <div className="flex gap-2 flex-1 items-center">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="uložit"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="zrušit"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-800 flex-1">
                          {ingredient}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(index)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="upravit ingredienci"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="smazat ingredienci"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Uložit
          </button>
        </div>
      </div>
    </div>
  );
}
